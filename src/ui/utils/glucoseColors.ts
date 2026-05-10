/**
 * Centralized glucose color classification.
 *
 * All components should use these functions instead of duplicating
 * threshold logic. This ensures consistent coloring across the entire UI.
 *
 * Clinical thresholds (configurable via settings):
 * - Below low threshold → out-of-range (red)
 * - At exact threshold → border-range (amber)
 * - Between thresholds → in-range (green)
 * - Above high threshold → out-of-range (red)
 */

export interface GlucoseThresholds {
  low: number;
  high: number;
}

export const DEFAULT_THRESHOLDS: GlucoseThresholds = { low: 70, high: 180 };

export function getColorClass(
  value: number,
  thresholds: GlucoseThresholds = DEFAULT_THRESHOLDS
): string {
  if (value < thresholds.low || value > thresholds.high) {
    return 'out-of-range';
  }
  if (value === thresholds.low || value === thresholds.high) {
    return 'border-range';
  }
  return 'in-range';
}

export function getGlowColor(value: number): string {
  if (value < DEFAULT_THRESHOLDS.low) return 'rgba(248, 113, 113, 0.15)';
  if (value > DEFAULT_THRESHOLDS.high) return 'rgba(251, 191, 36, 0.12)';
  return 'rgba(52, 211, 153, 0.12)';
}

// SD (Standard Deviation) clinical thresholds
// < 20: good, 20-40: warning, > 40: alert
export function getSDColorClass(sd: number): string {
  if (sd > 40) return 'out-of-range';
  if (sd >= 20) return 'border-range';
  return 'in-range';
}

// CV (Coefficient of Variation) clinical thresholds
// < 25%: good, 25-36%: warning, > 36%: alert
export function getCVColorClass(cv: number): string {
  if (cv > 36) return 'out-of-range';
  if (cv >= 25) return 'border-range';
  return 'in-range';
}
