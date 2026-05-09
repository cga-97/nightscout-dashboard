import { GlucoseReading } from '../domain/models/GlucoseReading';
import { DailyTrend } from '../domain/models/DailyTrend';

export class CalculateDailyTrends {
  private readonly low: number;
  private readonly high: number;

  constructor(options: { low?: number; high?: number } = {}) {
    this.low = options.low ?? 70;
    this.high = options.high ?? 180;
  }

  execute(readings: GlucoseReading[]): DailyTrend[] {
    if (readings.length === 0) return [];
    
    const dayMap = new Map<string, GlucoseReading[]>();
    
    for (const r of readings) {
      const key = r.timestamp.toISOString().split('T')[0];
      if (!dayMap.has(key)) dayMap.set(key, []);
      dayMap.get(key)!.push(r);
    }
    
    const results: DailyTrend[] = [];
    
    for (const [key, dayReadings] of dayMap) {
      const values = dayReadings.map(r => r.value);
      const avg = values.reduce((s, v) => s + v, 0) / values.length;
      const inRange = dayReadings.filter(r => r.value >= this.low && r.value <= this.high).length;
      
      results.push({
        date: new Date(key),
        averageGlucose: avg,
        tirPercentage: (inRange / dayReadings.length) * 100,
        readingsCount: dayReadings.length,
      });
    }
    
    return results.sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}
