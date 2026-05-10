import { GlucoseReading } from '../domain/models/GlucoseReading';
import { GMI } from '../domain/models/GMI';
import { GMI_BASE, GMI_FACTOR } from '../domain/constants';

export class CalculateGMI {
  execute(readings: GlucoseReading[]): GMI | null {
    if (readings.length === 0) {
      return null;
    }

    const values = readings.map((r) => r.value);
    const averageGlucose = values.reduce((sum, v) => sum + v, 0) / values.length;

    const gmiPercentage = GMI_BASE + GMI_FACTOR * averageGlucose;

    return {
      gmiPercentage,
      averageGlucose,
    };
  }
}
