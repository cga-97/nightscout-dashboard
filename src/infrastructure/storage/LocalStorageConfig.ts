const BASE_URL_KEY = 'nsd_baseUrl';
const API_SECRET_KEY = 'nsd_apiSecret';

export interface StorageConfig {
  baseUrl?: string;
  apiSecret?: string;
}

export function getConfig(): StorageConfig {
  const baseUrl = localStorage.getItem(BASE_URL_KEY) ?? undefined;
  const apiSecret = localStorage.getItem(API_SECRET_KEY) ?? undefined;
  return { baseUrl, apiSecret };
}

export function setConfig(config: StorageConfig): void {
  if (config.baseUrl !== undefined) {
    localStorage.setItem(BASE_URL_KEY, config.baseUrl);
  } else {
    localStorage.removeItem(BASE_URL_KEY);
  }

  if (config.apiSecret !== undefined) {
    localStorage.setItem(API_SECRET_KEY, config.apiSecret);
  } else {
    localStorage.removeItem(API_SECRET_KEY);
  }
}

export function clearConfig(): void {
  localStorage.removeItem(BASE_URL_KEY);
  localStorage.removeItem(API_SECRET_KEY);
}
