export interface HistogramBin {
  rangeStart: number; // mg/dL
  rangeEnd: number;   // mg/dL
  count: number;
  percentage: number;
}

export interface DistributionHistogram {
  bins: HistogramBin[];
  totalReadings: number;
  lowThreshold: number;
  highThreshold: number;
}
