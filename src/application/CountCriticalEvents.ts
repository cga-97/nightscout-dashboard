import { GlucoseReading } from '../domain/models/GlucoseReading';
import { CriticalEvents } from '../domain/models/CriticalEvents';
import { DEFAULT_LOW_THRESHOLD, DEFAULT_HIGH_THRESHOLD, SEVERE_LOW_THRESHOLD, SEVERE_HIGH_THRESHOLD } from '../domain/constants';

export class CountCriticalEvents {
  private readonly low: number;
  private readonly high: number;
  private readonly severeLow = SEVERE_LOW_THRESHOLD;
  private readonly severeHigh = SEVERE_HIGH_THRESHOLD;

  constructor(options: { low?: number; high?: number } = {}) {
    this.low = options.low ?? DEFAULT_LOW_THRESHOLD;
    this.high = options.high ?? DEFAULT_HIGH_THRESHOLD;
  }

  execute(readings: GlucoseReading[]): CriticalEvents {
    const severeHypos = readings.filter((r) => r.value < this.severeLow).length;
    const hypos = readings.filter((r) => r.value < this.low).length;
    const hypers = readings.filter((r) => r.value > this.high).length;
    const severeHypers = readings.filter((r) => r.value > this.severeHigh).length;

    return {
      hypos,
      severeHypos,
      hypers,
      severeHypers,
    };
  }
}
