import { GlucoseReading } from '../domain/models/GlucoseReading';
import { CriticalEvents } from '../domain/models/CriticalEvents';

export class CountCriticalEvents {
  private readonly low: number;
  private readonly high: number;
  private readonly severeLow = 54;
  private readonly severeHigh = 250;

  constructor(options: { low?: number; high?: number } = {}) {
    this.low = options.low ?? 70;
    this.high = options.high ?? 180;
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
