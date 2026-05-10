/**
 * Shared direction arrow mapping for glucose trend indicators.
 * Used by CurrentGlucose, GlucoseChart, and any component that
 * needs to display CGM direction arrows.
 */
export const DIRECTION_ARROWS: Record<string, string> = {
  Flat: '→',
  SingleUp: '↑',
  DoubleUp: '↑↑',
  SingleDown: '↓',
  DoubleDown: '↓↓',
  FortyFiveUp: '↗',
  FortyFiveDown: '↘',
  None: '–',
};

export function getDirectionArrow(direction: string): string {
  return DIRECTION_ARROWS[direction] ?? '';
}
