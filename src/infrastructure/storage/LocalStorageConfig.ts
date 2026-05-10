const BASE_URL_KEY = 'nsd_baseUrl';
// sessionStorage clears when the tab closes, preventing long-term secret exposure while keeping the session convenient
const API_SECRET_KEY = 'nsd_apiSecret';

export interface StorageConfig {
  baseUrl?: string;
  apiSecret?: string;
}

export interface ThresholdConfig {
  low: number;
  high: number;
}

export function saveThresholds(thresholds: ThresholdConfig): void {
  localStorage.setItem('ns_thresholds', JSON.stringify(thresholds));
}

export function getThresholds(): ThresholdConfig {
  const raw = localStorage.getItem('ns_thresholds');
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // ignore
    }
  }
  return { low: 70, high: 180 };
}

export function getConfig(): StorageConfig {
  const baseUrl = localStorage.getItem(BASE_URL_KEY) ?? undefined;
  const apiSecret = sessionStorage.getItem(API_SECRET_KEY) ?? undefined;
  return { baseUrl, apiSecret };
}

export function setConfig(config: StorageConfig): void {
  if (config.baseUrl !== undefined) {
    localStorage.setItem(BASE_URL_KEY, config.baseUrl);
  } else {
    localStorage.removeItem(BASE_URL_KEY);
  }

  if (config.apiSecret !== undefined) {
    sessionStorage.setItem(API_SECRET_KEY, config.apiSecret);
  } else {
    sessionStorage.removeItem(API_SECRET_KEY);
  }
}

const VIEW_MODE_KEY = 'nsd_viewMode';
const LIVE_RANGE_KEY = 'nsd_liveRange';
const ANALYSIS_RANGE_KEY = 'nsd_analysisRange';

export function saveViewMode(mode: 'live' | 'analysis'): void {
  localStorage.setItem(VIEW_MODE_KEY, mode);
}

export function getViewMode(): 'live' | 'analysis' {
  const mode = localStorage.getItem(VIEW_MODE_KEY);
  return mode === 'analysis' ? 'analysis' : 'live';
}

export function saveLiveRange(hours: number): void {
  localStorage.setItem(LIVE_RANGE_KEY, String(hours));
}

export function getLiveRange(): number {
  const raw = localStorage.getItem(LIVE_RANGE_KEY);
  const parsed = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 6;
}

export function saveAnalysisRange(hours: number): void {
  localStorage.setItem(ANALYSIS_RANGE_KEY, String(hours));
}

export function getAnalysisRange(): number {
  const raw = localStorage.getItem(ANALYSIS_RANGE_KEY);
  const parsed = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 168;
}

export function clearConfig(): void {
  localStorage.removeItem(BASE_URL_KEY);
  sessionStorage.removeItem(API_SECRET_KEY);
}

export function hasPersistedSecret(): boolean {
  return sessionStorage.getItem(API_SECRET_KEY) !== null;
}
