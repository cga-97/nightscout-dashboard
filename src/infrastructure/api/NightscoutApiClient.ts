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

export class NightscoutApiClient extends NightscoutRepository {
  private readonly baseUrl: string;
  private readonly apiSecret: string | undefined;

  constructor(config: { baseUrl: string; apiSecret?: string }) {
    super();
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiSecret = config.apiSecret;
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
    const count = Math.max(1, Math.round(hours * 12));
    const entries = await this.request<NightscoutEntry[]>(
      `/api/v1/entries.json?count=${count}`
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
    const value =
      typeof entry.sgv === 'string' ? parseFloat(entry.sgv) : entry.sgv;

    return {
      timestamp: new Date(entry.date),
      value: Number.isFinite(value) ? value : NaN,
      direction: entry.direction,
      device: entry.device,
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
