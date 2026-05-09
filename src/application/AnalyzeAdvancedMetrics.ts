import { GlucoseReading } from '../domain/models/GlucoseReading';
import { AdvancedMetrics } from '../domain/models/AdvancedMetrics';

export class AnalyzeAdvancedMetrics {
  private readonly low: number;
  private readonly high: number;
  private readonly veryLow = 54;
  private readonly veryHigh = 250;

  constructor(options: { low?: number; high?: number } = {}) {
    this.low = options.low ?? 70;
    this.high = options.high ?? 180;
  }

  execute(readings: GlucoseReading[]): AdvancedMetrics | null {
    if (readings.length === 0) return null;

    const total = readings.length;
    const inRange = readings.filter(r => r.value >= this.low && r.value <= this.high).length;
    const tbr1 = readings.filter(r => r.value < this.low).length;
    const tbr2 = readings.filter(r => r.value < this.veryLow).length;
    const tar1 = readings.filter(r => r.value > this.high && r.value <= this.veryHigh).length;
    const tar2 = readings.filter(r => r.value > this.veryHigh).length;
    
    const values = readings.map(r => r.value);
    const avg = values.reduce((s, v) => s + v, 0) / total;
    const gmi = 3.31 + 0.02392 * avg;
    
    const mean = avg;
    const squaredDiffSum = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0);
    const sd = Math.sqrt(squaredDiffSum / total);
    const cv = (sd / mean) * 100;
    
    return {
      tirPercentage: (inRange / total) * 100,
      tbrLevel1Percentage: (tbr1 / total) * 100,
      tbrLevel2Percentage: (tbr2 / total) * 100,
      tarLevel1Percentage: (tar1 / total) * 100,
      tarLevel2Percentage: (tar2 / total) * 100,
      gmiPercentage: gmi,
      coefficientOfVariation: cv,
      averageGlucose: avg,
      totalReadings: total,
      lowThreshold: this.low,
      highThreshold: this.high,
    };
  }
}
