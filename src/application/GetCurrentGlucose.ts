import { GlucoseReading } from '../domain/models/GlucoseReading';
import { NightscoutRepository } from '../domain/repositories/NightscoutRepository';
import { STALE_READING_MS } from '../domain/constants';

export class GetCurrentGlucose {
  constructor(private readonly repository: NightscoutRepository) {}

  async execute(): Promise<GlucoseReading | null> {
    const reading = await this.repository.getLatestEntry();

    if (reading) {
      const ageMs = Date.now() - reading.timestamp.getTime();
      const maxAgeMs = STALE_READING_MS;
      if (ageMs > maxAgeMs) {
        console.warn(`Glucose reading is stale: ${Math.round(ageMs / 60000)} minutes old`);
      }
    }

    return reading;
  }
}
