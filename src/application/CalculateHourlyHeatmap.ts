import { GlucoseReading } from '../domain/models/GlucoseReading';
import { HourlyHeatmap, HeatmapCell } from '../domain/models/HourlyHeatmap';
import { DEFAULT_LOW_THRESHOLD, DEFAULT_HIGH_THRESHOLD } from '../domain/constants';

export class CalculateHourlyHeatmap {
  private readonly low: number;
  private readonly high: number;

  constructor(options: { low?: number; high?: number } = {}) {
    this.low = options.low ?? DEFAULT_LOW_THRESHOLD;
    this.high = options.high ?? DEFAULT_HIGH_THRESHOLD;
  }

  execute(readings: GlucoseReading[]): HourlyHeatmap {
    if (readings.length === 0) {
      return { cells: [], lowThreshold: this.low, highThreshold: this.high };
    }

    // Group by (dayOfWeek, hour)
    const cellMap = new Map<string, number[]>();

    for (const r of readings) {
      const d = r.timestamp;
      const dayOfWeek = d.getDay();
      const hour = d.getHours();
      const key = `${dayOfWeek}-${hour}`;
      
      if (!cellMap.has(key)) cellMap.set(key, []);
      cellMap.get(key)!.push(r.value);
    }

    const cells: HeatmapCell[] = [];

    for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
      for (let hour = 0; hour <= 23; hour++) {
        const key = `${dayOfWeek}-${hour}`;
        const values = cellMap.get(key);
        
        if (values && values.length > 0) {
          const avg = values.reduce((s, v) => s + v, 0) / values.length;
          cells.push({ dayOfWeek, hour, averageGlucose: avg, readingsCount: values.length });
        } else {
          cells.push({ dayOfWeek, hour, averageGlucose: NaN, readingsCount: 0 });
        }
      }
    }

    return {
      cells,
      lowThreshold: this.low,
      highThreshold: this.high,
    };
  }
}
