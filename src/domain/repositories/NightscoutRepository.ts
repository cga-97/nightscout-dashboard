import { GlucoseReading } from '../models/GlucoseReading';
import { Treatment } from '../models/Treatment';

export abstract class NightscoutRepository {
  abstract getLatestEntry(): Promise<GlucoseReading | null>;
  abstract getHistory(hours: number): Promise<GlucoseReading[]>;
  abstract getTreatments(since: Date): Promise<Treatment[]>;
}
