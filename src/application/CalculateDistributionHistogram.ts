import { GlucoseReading } from '../domain/models/GlucoseReading';
import { DistributionHistogram, HistogramBin } from '../domain/models/DistributionHistogram';

export class CalculateDistributionHistogram {
  private readonly low: number;
  private readonly high: number;

  constructor(options: { low?: number; high?: number } = {}) {
    this.low = options.low ?? 70;
    this.high = options.high ?? 180;
  }

  execute(readings: GlucoseReading[]): DistributionHistogram {
    if (readings.length === 0) {
      return {
        bins: [],
        totalReadings: 0,
        lowThreshold: this.low,
        highThreshold: this.high,
      };
    }

    const values = readings.map((r) => r.value);
    const max = Math.max(...values);

    // Fixed bins: <40, 40-54, 54-70, 70-100, 100-140, 140-180, 180-250, >250
    const binRanges: [number, number][] = [
      [0, 40],
      [40, 54],
      [54, 70],
      [70, 100],
      [100, 140],
      [140, 180],
      [180, 250],
      [250, 400],
    ];

    const total = readings.length;
    const bins: HistogramBin[] = binRanges.map(([start, end]) => {
      const count = values.filter((v) => v >= start && v < end).length;
      return {
        rangeStart: start,
        rangeEnd: end,
        count,
        percentage: (count / total) * 100,
      };
    });

    // Add overflow bin for >400
    const overflowCount = values.filter((v) => v >= 400).length;
    if (overflowCount > 0) {
      bins.push({
        rangeStart: 400,
        rangeEnd: Math.ceil(max),
        count: overflowCount,
        percentage: (overflowCount / total) * 100,
      });
    }

    return {
      bins,
      totalReadings: total,
      lowThreshold: this.low,
      highThreshold: this.high,
    };
  }
}
