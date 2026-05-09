import { GlucoseReading } from '../domain/models/GlucoseReading';
import { GMI } from '../domain/models/GMI';

export class CalculateGMI {
  execute(readings: GlucoseReading[]): GMI | null {
    if (readings.length === 0) {
      return null;
    }

    const values = readings.map((r) => r.value);
    const averageGlucose = values.reduce((sum, v) => sum + v, 0) / values.length;

    // ADA GMI formula: 3.31 + 0.02392 * mean_glucose_mgdl
    const gmiPercentage = 3.31 + 0.02392 * averageGlucose;

    return {
      gmiPercentage,
      averageGlucose,
    };
  }
}
