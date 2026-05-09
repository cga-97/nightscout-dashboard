export interface TimeInRange {
  percentage: number;
  low: number; // default range low, e.g., 70
  high: number; // default range high, e.g., 180
  veryLowPercentage?: number;  // < 54
  lowPercentage?: number;      // 54-70
  veryHighPercentage?: number; // > 250
  highPercentage?: number;     // 180-250
}
