import { GlucoseReading } from '../domain/models/GlucoseReading';
import { CriticalEvents } from '../domain/models/CriticalEvents';

export class CountCriticalEvents {
  execute(readings: GlucoseReading[]): CriticalEvents {
    const severeHypos = readings.filter((r) => r.value < 54).length;
    const hypos = readings.filter((r) => r.value < 70).length;
    const hypers = readings.filter((r) => r.value > 180).length;
    const severeHypers = readings.filter((r) => r.value > 250).length;

    return {
      hypos,
      severeHypos,
      hypers,
      severeHypers,
    };
  }
}
