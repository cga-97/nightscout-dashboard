import { GlucoseReading } from '../domain/models/GlucoseReading';
import { TimeInRange } from '../domain/models/TimeInRange';
import { DEFAULT_LOW_THRESHOLD, DEFAULT_HIGH_THRESHOLD } from '../domain/constants';

export class CalculateTimeInRange {
  private readonly low: number;
  private readonly high: number;

  constructor(options: { low?: number; high?: number } = {}) {
    this.low = options.low ?? DEFAULT_LOW_THRESHOLD;
    this.high = options.high ?? DEFAULT_HIGH_THRESHOLD;
  }

  execute(readings: GlucoseReading[]): TimeInRange {
    if (readings.length === 0) {
      return { percentage: 0, low: this.low, high: this.high };
    }

    const inRangeCount = readings.filter(
      (r) => r.value >= this.low && r.value <= this.high
    ).length;

    const percentage = (inRangeCount / readings.length) * 100;

    return { percentage, low: this.low, high: this.high };
  }
}
