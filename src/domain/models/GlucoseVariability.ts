export interface GlucoseVariability {
  standardDeviation: number; // mg/dL
  coefficientOfVariation: number; // percentage, 0-100+
  minGlucose: number;
  maxGlucose: number;
}
