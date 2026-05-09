export interface Treatment {
  timestamp: Date;
  eventType: string;
  notes?: string;
  insulin?: number;
  carbs?: number;
}
