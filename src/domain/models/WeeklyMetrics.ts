export interface WeeklyMetrics {
  weekStart: Date;
  weekEnd: Date;
  tirPercentage: number;
  tbrLevel1Percentage: number;
  tbrLevel2Percentage: number;
  tarLevel1Percentage: number;
  tarLevel2Percentage: number;
  averageGlucose: number;
  coefficientOfVariation: number;
  severeHypoCount: number;  // readings < 54
  severeHyperCount: number; // readings > 250
  totalReadings: number;
}
