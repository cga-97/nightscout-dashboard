import { GlucoseReading } from '../domain/models/GlucoseReading';
import { NightscoutRepository } from '../domain/repositories/NightscoutRepository';

export class GetGlucoseHistory {
  constructor(private readonly repository: NightscoutRepository) {}

  async execute(hours: number): Promise<GlucoseReading[]> {
    if (!Number.isFinite(hours) || hours <= 0) {
      throw new Error(`Invalid hours parameter: ${hours}. Must be a positive number.`);
    }
    if (hours > 2160) {
      throw new Error(`Hours parameter too large: ${hours}. Maximum is 2160 (90 days).`);
    }
    return this.repository.getHistory(hours);
  }
}
