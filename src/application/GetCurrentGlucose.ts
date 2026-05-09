import { GlucoseReading } from '../domain/models/GlucoseReading';
import { NightscoutRepository } from '../domain/repositories/NightscoutRepository';

export class GetCurrentGlucose {
  constructor(private readonly repository: NightscoutRepository) {}

  async execute(): Promise<GlucoseReading | null> {
    return this.repository.getLatestEntry();
  }
}
