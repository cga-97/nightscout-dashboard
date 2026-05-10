// Clinical thresholds (mg/dL)
export const DEFAULT_LOW_THRESHOLD = 70;
export const DEFAULT_HIGH_THRESHOLD = 180;
export const SEVERE_LOW_THRESHOLD = 54;
export const SEVERE_HIGH_THRESHOLD = 250;

// Glucose Management Indicator (ADA formula)
export const GMI_BASE = 3.31;
export const GMI_FACTOR = 0.02392;

// CGM reading interval (typical: every 5 minutes)
export const CGM_READINGS_PER_HOUR = 12;

// Refresh interval
export const REFRESH_INTERVAL_MS = 300_000; // 5 minutes

// Staleness threshold (readings older than this are considered stale)
export const STALE_READING_MS = 15 * 60 * 1000; // 15 minutes

// API limits
export const MAX_HISTORY_HOURS = 2160; // 90 days
export const API_MAX_COUNT = 10_000;
