import { GlucoseReading } from '../../domain/models/GlucoseReading';
import { Treatment } from '../../domain/models/Treatment';
import { NightscoutRepository } from '../../domain/repositories/NightscoutRepository';

interface NightscoutEntry {
  sgv: string | number;
  date: number; // epoch ms
  direction?: string;
  device?: string;
}

interface NightscoutTreatment {
  created_at: string; // ISO string
  eventType?: string;
  notes?: string;
  insulin?: number;
  carbs?: number;
}

interface NightscoutStatus {
  settings?: {
    units?: string;
  };
}

export class NightscoutApiClient extends NightscoutRepository {
  private readonly baseUrl: string;
  private readonly apiSecret: string | undefined;
  private units: 'mg/dL' | 'mmol/L' = 'mg/dL';

  constructor(config: { baseUrl: string; apiSecret?: string }) {
    super();
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiSecret = config.apiSecret;
  }

  async detectUnits(): Promise<void> {
    try {
      const status = await this.request<NightscoutStatus>('/api/v1/status.json');
      const raw = status.settings?.units?.toLowerCase() ?? '';
      if (raw === 'mmol' || raw === 'mmol/l') {
        this.units = 'mmol/L';
        return;
      }
    } catch {
      // Fallback: try to infer from the latest entry
    }

    try {
      const entry = await this.getLatestEntryRaw();
      if (entry && entry.value > 0 && entry.value < 30) {
        this.units = 'mmol/L';
        return;
      }
    } catch {
      // ignore
    }

    this.units = 'mg/dL';
  }

  private async getLatestEntryRaw(): Promise<{ value: number } | null> {
    const entries = await this.request<NightscoutEntry[]>(
      '/api/v1/entries.json?count=1'
    );
    if (!Array.isArray(entries) || entries.length === 0) {
      return null;
    }
    const value =
      typeof entries[0].sgv === 'string'
        ? parseFloat(entries[0].sgv)
        : entries[0].sgv;
    return { value: Number.isFinite(value) ? value : NaN };
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (this.apiSecret) {
      headers['api-secret'] = this.apiSecret;
    }
    return headers;
  }

  private async request<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    let response: Response;

    try {
      response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });
    } catch (networkError) {
      throw new Error(
        `Network error fetching Nightscout data: ${networkError instanceof Error ? networkError.message : String(networkError)}`
      );
    }

    if (!response.ok) {
      throw new Error(
        `Nightscout API error: ${response.status} ${response.statusText}`
      );
    }

    try {
      return (await response.json()) as T;
    } catch (parseError) {
      throw new Error(
        `Failed to parse Nightscout response: ${parseError instanceof Error ? parseError.message : String(parseError)}`
      );
    }
  }

  async getLatestEntry(): Promise<GlucoseReading | null> {
    const entries = await this.request<NightscoutEntry[]>(
      '/api/v1/entries.json?count=1'
    );

    if (!Array.isArray(entries) || entries.length === 0) {
      return null;
    }

    const entry = entries[0];
    return this.mapEntryToGlucoseReading(entry);
  }

  async getHistory(hours: number): Promise<GlucoseReading[]> {
    const cutoffEpoch = Date.now() - hours * 60 * 60 * 1000;
    // count=10000 ensures we get enough data for long ranges while
    // the date filter prevents fetching the entire database
    const entries = await this.request<NightscoutEntry[]>(
      `/api/v1/entries.json?find[date][$gte]=${cutoffEpoch}&count=10000`
    );

    if (!Array.isArray(entries)) {
      return [];
    }

    return entries.map((entry) => this.mapEntryToGlucoseReading(entry));
  }

  async getTreatments(since: Date): Promise<Treatment[]> {
    const sinceIso = since.toISOString();
    const treatments = await this.request<NightscoutTreatment[]>(
      `/api/v1/treatments.json?find[created_at][$gte]=${encodeURIComponent(sinceIso)}`
    );

    if (!Array.isArray(treatments)) {
      return [];
    }

    return treatments.map((t) => this.mapTreatment(t));
  }

  private mapEntryToGlucoseReading(entry: NightscoutEntry): GlucoseReading {
    const rawValue =
      typeof entry.sgv === 'string' ? parseFloat(entry.sgv) : entry.sgv;
    const value = Number.isFinite(rawValue) ? rawValue : NaN;
    const converted = this.units === 'mmol/L' ? value * 18 : value;

    return {
      timestamp: new Date(entry.date),
      value: converted,
      direction: entry.direction,
      device: entry.device,
      units: this.units,
    };
  }

  private mapTreatment(t: NightscoutTreatment): Treatment {
    return {
      timestamp: new Date(t.created_at),
      eventType: t.eventType ?? 'Unknown',
      notes: t.notes,
      insulin: t.insulin,
      carbs: t.carbs,
    };
  }
}
