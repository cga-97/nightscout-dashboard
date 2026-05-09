import { GlucoseReading } from '../domain/models/GlucoseReading';

export interface HypoAlert {
  triggered: boolean;
  value?: number;
  timestamp?: Date;
}

export class CheckSevereHypo {
  private lastAlertTime: number = 0;
  private readonly cooldownMs: number;

  constructor(cooldownMinutes = 15) {
    this.cooldownMs = cooldownMinutes * 60 * 1000;
  }

  execute(reading: GlucoseReading | null): HypoAlert {
    if (!reading || reading.value >= 54) {
      return { triggered: false };
    }

    const now = Date.now();
    if (now - this.lastAlertTime < this.cooldownMs) {
      return { triggered: false };
    }

    this.lastAlertTime = now;
    return {
      triggered: true,
      value: reading.value,
      timestamp: reading.timestamp,
    };
  }
}
