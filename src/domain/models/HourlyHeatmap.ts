export interface HeatmapCell {
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  hour: number; // 0-23
  averageGlucose: number;
  readingsCount: number;
}

export interface HourlyHeatmap {
  cells: HeatmapCell[];
  lowThreshold: number;
  highThreshold: number;
}
