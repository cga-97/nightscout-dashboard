export interface AdvancedMetrics {
  tirPercentage: number;        // Time in Range 70-180
  tbrLevel1Percentage: number;  // < 70
  tbrLevel2Percentage: number;  // < 54
  tarLevel1Percentage: number;  // 180-250
  tarLevel2Percentage: number;  // > 250
  gmiPercentage: number;        // Glucose Management Indicator
  coefficientOfVariation: number;
  averageGlucose: number;
  totalReadings: number;
  lowThreshold: number;
  highThreshold: number;
}
