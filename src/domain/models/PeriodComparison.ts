export interface PeriodMetrics {
  label: string;
  tirPercentage: number;
  averageGlucose: number;
  coefficientOfVariation: number;
  gmiPercentage: number;
  totalReadings: number;
}

export interface PeriodComparison {
  currentPeriod: PeriodMetrics;
  previousPeriod: PeriodMetrics;
  tirChange: number; // percentage points difference
  averageChange: number; // mg/dL difference
  cvChange: number; // percentage points difference
}
