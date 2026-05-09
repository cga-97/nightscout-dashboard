export interface HourlyPattern {
  hourStart: number; // 0-23
  hourEnd: number; // 1-24
  averageGlucose: number;
  readingsCount: number;
  timeInRangePercentage: number;
}
