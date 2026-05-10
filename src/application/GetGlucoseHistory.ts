import { GlucoseReading } from '../domain/models/GlucoseReading';
import { NightscoutRepository } from '../domain/repositories/NightscoutRepository';
import { MAX_HISTORY_HOURS } from '../domain/constants';

export class GetGlucoseHistory {
  constructor(private readonly repository: NightscoutRepository) {}

  async execute(hours: number): Promise<GlucoseReading[]> {
    if (!Number.isFinite(hours) || hours <= 0) {
      throw new Error(`Invalid hours parameter: ${hours}. Must be a positive number.`);
    }
    if (hours > MAX_HISTORY_HOURS) {
      throw new Error(`Hours parameter too large: ${hours}. Maximum is ${MAX_HISTORY_HOURS} (90 days).`);
    }
    return this.repository.getHistory(hours);
  }
}
