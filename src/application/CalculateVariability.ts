import { GlucoseReading } from '../domain/models/GlucoseReading';
import { GlucoseVariability } from '../domain/models/GlucoseVariability';

export class CalculateVariability {
  execute(readings: GlucoseReading[]): GlucoseVariability {
    if (readings.length === 0) {
      return {
        standardDeviation: NaN,
        coefficientOfVariation: NaN,
        minGlucose: 0,
        maxGlucose: 0,
      };
    }

    const values = readings.map((r) => r.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;

    const squaredDiffSum = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0);
    const standardDeviation = Math.sqrt(squaredDiffSum / values.length);
    const coefficientOfVariation = (standardDeviation / mean) * 100;

    const minGlucose = Math.min(...values);
    const maxGlucose = Math.max(...values);

    return {
      standardDeviation,
      coefficientOfVariation,
      minGlucose,
      maxGlucose,
    };
  }
}
