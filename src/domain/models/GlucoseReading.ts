export interface GlucoseReading {
  timestamp: Date;
  value: number; // always stored as mg/dL internally
  direction?: string; // e.g., 'Flat', 'SingleUp', 'DoubleDown'
  device?: string;
  units?: 'mg/dL' | 'mmol/L'; // original unit from source
}
