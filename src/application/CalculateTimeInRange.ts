import { GlucoseReading } from '../domain/models/GlucoseReading';
import { TimeInRange } from '../domain/models/TimeInRange';

export class CalculateTimeInRange {
  private readonly low: number;
  private readonly high: number;

  constructor(options: { low?: number; high?: number } = {}) {
    this.low = options.low ?? 70;
    this.high = options.high ?? 180;
  }

  async execute(readings: GlucoseReading[]): Promise<TimeInRange> {
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
