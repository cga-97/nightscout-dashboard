import { GlucoseReading } from '../domain/models/GlucoseReading';
import { NightscoutRepository } from '../domain/repositories/NightscoutRepository';

export class GetCurrentGlucose {
  constructor(private readonly repository: NightscoutRepository) {}

  async execute(): Promise<GlucoseReading | null> {
    const reading = await this.repository.getLatestEntry();

    if (reading) {
      const ageMs = Date.now() - reading.timestamp.getTime();
      const maxAgeMs = 15 * 60 * 1000;
      if (ageMs > maxAgeMs) {
        console.warn(`Glucose reading is stale: ${Math.round(ageMs / 60000)} minutes old`);
      }
    }

    return reading;
  }
}
