import { GlucoseReading } from '../domain/models/GlucoseReading';
import { CGM_READINGS_PER_HOUR } from '../domain/constants';

export interface DataQuality {
  expectedReadings: number;
  actualReadings: number;
  coveragePercentage: number;
}

export class CalculateDataQuality {
  execute(readings: GlucoseReading[], hours: number): DataQuality {
    const expectedReadings = Math.round(hours * CGM_READINGS_PER_HOUR);
    const actualReadings = readings.length;
    const coveragePercentage =
      expectedReadings > 0
        ? Math.min(100, (actualReadings / expectedReadings) * 100)
        : 0;

    return {
      expectedReadings,
      actualReadings,
      coveragePercentage,
    };
  }
}
