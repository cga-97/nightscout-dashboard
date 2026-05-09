import { GlucoseReading } from '../domain/models/GlucoseReading';
import { WeeklyMetrics } from '../domain/models/WeeklyMetrics';

export class CalculateWeeklyComparison {
  private readonly low: number;
  private readonly high: number;
  private readonly veryLow = 54;
  private readonly veryHigh = 250;

  constructor(options: { low?: number; high?: number } = {}) {
    this.low = options.low ?? 70;
    this.high = options.high ?? 180;
  }

  execute(readings: GlucoseReading[]): WeeklyMetrics[] {
    if (readings.length === 0) return [];
    
    // Group by ISO week (Monday start)
    const weekMap = new Map<string, GlucoseReading[]>();
    
    for (const r of readings) {
      const d = r.timestamp;
      // Get Monday of this week
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d);
      monday.setDate(diff);
      monday.setHours(0, 0, 0, 0);
      const key = monday.toISOString().split('T')[0];
      
      if (!weekMap.has(key)) weekMap.set(key, []);
      weekMap.get(key)!.push(r);
    }
    
    const results: WeeklyMetrics[] = [];
    
    for (const [key, weekReadings] of weekMap) {
      const weekStart = new Date(key);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const total = weekReadings.length;
      const values = weekReadings.map(r => r.value);
      const avg = values.reduce((s, v) => s + v, 0) / total;
      const inRange = weekReadings.filter(r => r.value >= this.low && r.value <= this.high).length;
      const tbr1 = weekReadings.filter(r => r.value < this.low).length;
      const tbr2 = weekReadings.filter(r => r.value < this.veryLow).length;
      const tar1 = weekReadings.filter(r => r.value > this.high && r.value <= this.veryHigh).length;
      const tar2 = weekReadings.filter(r => r.value > this.veryHigh).length;
      
      const mean = avg;
      const squaredDiffSum = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0);
      const sd = Math.sqrt(squaredDiffSum / total);
      const cv = (sd / mean) * 100;
      
      results.push({
        weekStart,
        weekEnd,
        tirPercentage: (inRange / total) * 100,
        tbrLevel1Percentage: (tbr1 / total) * 100,
        tbrLevel2Percentage: (tbr2 / total) * 100,
        tarLevel1Percentage: (tar1 / total) * 100,
        tarLevel2Percentage: (tar2 / total) * 100,
        averageGlucose: avg,
        coefficientOfVariation: cv,
        severeHypoCount: tbr2,
        severeHyperCount: tar2,
        totalReadings: total,
      });
    }
    
    return results.sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
  }
}
