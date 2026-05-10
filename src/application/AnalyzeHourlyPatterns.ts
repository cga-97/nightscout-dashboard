import { GlucoseReading } from '../domain/models/GlucoseReading';
import { HourlyPattern } from '../domain/models/HourlyPattern';
import { DEFAULT_LOW_THRESHOLD, DEFAULT_HIGH_THRESHOLD } from '../domain/constants';

export class AnalyzeHourlyPatterns {
  private readonly low: number;
  private readonly high: number;

  constructor(options: { low?: number; high?: number } = {}) {
    this.low = options.low ?? DEFAULT_LOW_THRESHOLD;
    this.high = options.high ?? DEFAULT_HIGH_THRESHOLD;
  }

  execute(readings: GlucoseReading[]): HourlyPattern[] {
    const blocks = [
      { hourStart: 0, hourEnd: 4 },
      { hourStart: 4, hourEnd: 8 },
      { hourStart: 8, hourEnd: 12 },
      { hourStart: 12, hourEnd: 16 },
      { hourStart: 16, hourEnd: 20 },
      { hourStart: 20, hourEnd: 24 },
    ];

    return blocks.map(({ hourStart, hourEnd }) => {
      const blockReadings = readings.filter((r) => {
        const hour = r.timestamp.getHours();
        return hour >= hourStart && hour < hourEnd;
      });

      if (blockReadings.length === 0) {
        return {
          hourStart,
          hourEnd,
          averageGlucose: 0,
          readingsCount: 0,
          timeInRangePercentage: 0,
        };
      }

      const values = blockReadings.map((r) => r.value);
      const averageGlucose =
        values.reduce((sum, v) => sum + v, 0) / values.length;

      const inRangeCount = blockReadings.filter(
        (r) => r.value >= this.low && r.value <= this.high
      ).length;
      const timeInRangePercentage =
        (inRangeCount / blockReadings.length) * 100;

      return {
        hourStart,
        hourEnd,
        averageGlucose,
        readingsCount: blockReadings.length,
        timeInRangePercentage,
      };
    });
  }
}
