export interface GlucoseReading {
  timestamp: Date;
  value: number; // mg/dL
  direction?: string; // e.g., 'Flat', 'SingleUp', 'DoubleDown'
  device?: string;
}
