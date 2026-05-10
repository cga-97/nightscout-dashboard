import { GlucoseReading } from '../../domain/models/GlucoseReading';
import { Treatment } from '../../domain/models/Treatment';

export interface CachedData {
  current: GlucoseReading | null;
  history: GlucoseReading[];
  treatments: Treatment[];
  timestamp: number;
}

export class DashboardCache {
  private cache = new Map<string, CachedData>();

  get(key: string): CachedData | undefined {
    const cached = this.cache.get(key);
    return cached;
  }

  set(key: string, data: CachedData): void {
    this.cache.set(key, data);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}
