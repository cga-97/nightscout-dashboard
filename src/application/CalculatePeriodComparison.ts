import { GlucoseReading } from '../domain/models/GlucoseReading';
import { PeriodComparison, PeriodMetrics } from '../domain/models/PeriodComparison';
import { DEFAULT_LOW_THRESHOLD, DEFAULT_HIGH_THRESHOLD, GMI_BASE, GMI_FACTOR } from '../domain/constants';

export class CalculatePeriodComparison {
  private readonly low: number;
  private readonly high: number;

  constructor(options: { low?: number; high?: number } = {}) {
    this.low = options.low ?? DEFAULT_LOW_THRESHOLD;
    this.high = options.high ?? DEFAULT_HIGH_THRESHOLD;
  }

  execute(readings: GlucoseReading[]): PeriodComparison | null {
    if (readings.length < 2) return null;

    // Sort by timestamp
    const sorted = [...readings].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Split into two halves
    const mid = Math.floor(sorted.length / 2);
    const previousReadings = sorted.slice(0, mid);
    const currentReadings = sorted.slice(mid);

    const current = this.calculateMetrics(currentReadings, 'Current Period');
    const previous = this.calculateMetrics(previousReadings, 'Previous Period');

    if (!current || !previous) return null;

    return {
      currentPeriod: current,
      previousPeriod: previous,
      tirChange: current.tirPercentage - previous.tirPercentage,
      averageChange: current.averageGlucose - previous.averageGlucose,
      cvChange: current.coefficientOfVariation - previous.coefficientOfVariation,
    };
  }

  private calculateMetrics(readings: GlucoseReading[], label: string): PeriodMetrics | null {
    if (readings.length === 0) return null;

    const values = readings.map((r) => r.value);
    const total = readings.length;
    const avg = values.reduce((s, v) => s + v, 0) / total;
    const inRange = readings.filter((r) => r.value >= this.low && r.value <= this.high).length;
    
    const mean = avg;
    const squaredDiffSum = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0);
    const sd = Math.sqrt(squaredDiffSum / total);
    const cv = (sd / mean) * 100;
    const gmi = GMI_BASE + GMI_FACTOR * avg;

    return {
      label,
      tirPercentage: (inRange / total) * 100,
      averageGlucose: avg,
      coefficientOfVariation: cv,
      gmiPercentage: gmi,
      totalReadings: total,
    };
  }
}
