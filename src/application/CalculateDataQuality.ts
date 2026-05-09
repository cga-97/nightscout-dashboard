import { GlucoseReading } from '../domain/models/GlucoseReading';

export interface DataQuality {
  expectedReadings: number;
  actualReadings: number;
  coveragePercentage: number;
}

export class CalculateDataQuality {
  execute(readings: GlucoseReading[], hours: number): DataQuality {
    // CGM typically reads every 5 minutes = 12 readings per hour
    const expectedReadings = Math.round(hours * 12);
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
