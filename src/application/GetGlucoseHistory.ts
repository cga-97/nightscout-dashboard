import { GlucoseReading } from '../domain/models/GlucoseReading';
import { NightscoutRepository } from '../domain/repositories/NightscoutRepository';

export class GetGlucoseHistory {
  constructor(private readonly repository: NightscoutRepository) {}

  async execute(hours: number): Promise<GlucoseReading[]> {
    return this.repository.getHistory(hours);
  }
}
