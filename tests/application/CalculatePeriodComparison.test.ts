import { describe, it, expect } from 'vitest'
import { CalculatePeriodComparison } from '../../src/application/CalculatePeriodComparison'
import { GlucoseReading } from '../../src/domain/models/GlucoseReading'

function makeReading(value: number, hoursAgo: number = 0): GlucoseReading {
  return {
    timestamp: new Date(Date.now() - hoursAgo * 3600000),
    value,
    units: 'mg/dL',
  }
}

function makeReadingAt(value: number, dateStr: string): GlucoseReading {
  return {
    timestamp: new Date(dateStr),
    value,
    units: 'mg/dL',
  }
}

describe('CalculatePeriodComparison', () => {
  it('returns null for empty readings', () => {
    const calc = new CalculatePeriodComparison()
    const result = calc.execute([])
    expect(result).toBeNull()
  })

  it('returns null for single reading', () => {
    const calc = new CalculatePeriodComparison()
    const result = calc.execute([makeReading(100)])
    expect(result).toBeNull()
  })

  it('splits readings into two halves by timestamp', () => {
    const calc = new CalculatePeriodComparison()
    const readings = [
      makeReadingAt(100, '2026-05-01T10:00:00Z'),
      makeReadingAt(120, '2026-05-03T10:00:00Z'),
      makeReadingAt(140, '2026-05-05T10:00:00Z'),
      makeReadingAt(160, '2026-05-07T10:00:00Z'),
    ]
    const result = calc.execute(readings)
    expect(result).not.toBeNull()
    expect(result!.currentPeriod.label).toBe('Current Period')
    expect(result!.previousPeriod.label).toBe('Previous Period')
    expect(result!.currentPeriod.totalReadings).toBe(2)
    expect(result!.previousPeriod.totalReadings).toBe(2)
  })

  it('calculates differences between periods', () => {
    const calc = new CalculatePeriodComparison()
    const readings = [
      // Previous period: all in range, lower avg
      makeReadingAt(80, '2026-05-01T10:00:00Z'),
      makeReadingAt(90, '2026-05-02T10:00:00Z'),
      // Current period: some out of range, higher avg
      makeReadingAt(100, '2026-05-03T10:00:00Z'),
      makeReadingAt(200, '2026-05-04T10:00:00Z'),
    ]
    const result = calc.execute(readings)
    expect(result).not.toBeNull()
    // Current: avg=150, TIR=50%
    // Previous: avg=85, TIR=100%
    expect(result!.tirChange).toBe(-50) // 50 - 100
    expect(result!.averageChange).toBe(65) // 150 - 85
  })

  it('correctly sorts readings by timestamp before splitting', () => {
    const calc = new CalculatePeriodComparison()
    // readings provided out of order
    const readings = [
      makeReadingAt(160, '2026-05-07T10:00:00Z'), // later
      makeReadingAt(100, '2026-05-01T10:00:00Z'), // earlier
      makeReadingAt(140, '2026-05-05T10:00:00Z'), // middle
      makeReadingAt(120, '2026-05-03T10:00:00Z'), // middle
    ]
    const result = calc.execute(readings)
    expect(result).not.toBeNull()
    // After sort: 100, 120, 140, 160
    // Previous: 100, 120 → avg=110
    // Current: 140, 160 → avg=150
    expect(result!.previousPeriod.averageGlucose).toBe(110)
    expect(result!.currentPeriod.averageGlucose).toBe(150)
    expect(result!.averageChange).toBe(40)
  })

  it('includes GMI in period metrics', () => {
    const calc = new CalculatePeriodComparison()
    const readings = [
      makeReadingAt(150, '2026-05-01T10:00:00Z'),
      makeReadingAt(150, '2026-05-03T10:00:00Z'),
    ]
    const result = calc.execute(readings)
    const expectedGmi = 3.31 + 0.02392 * 150
    expect(result!.currentPeriod.gmiPercentage).toBeCloseTo(expectedGmi, 2)
    expect(result!.previousPeriod.gmiPercentage).toBeCloseTo(expectedGmi, 2)
  })

  it('handles custom thresholds', () => {
    const calc = new CalculatePeriodComparison({ low: 80, high: 160 })
    const readings = [
      makeReadingAt(100, '2026-05-01T10:00:00Z'),  // in range (custom)
      makeReadingAt(50, '2026-05-03T10:00:00Z'),    // out of range (custom low)
    ]
    const result = calc.execute(readings)
    expect(result!.previousPeriod.tirPercentage).toBe(100)
    expect(result!.currentPeriod.tirPercentage).toBe(0)
  })

  it('calculates CV change', () => {
    const calc = new CalculatePeriodComparison()
    const readings = [
      makeReadingAt(100, '2026-05-01T10:00:00Z'),
      makeReadingAt(100, '2026-05-01T12:00:00Z'),
      makeReadingAt(100, '2026-05-03T10:00:00Z'),
      makeReadingAt(120, '2026-05-03T12:00:00Z'),
    ]
    const result = calc.execute(readings)
    // Previous period: both 100 → CV = 0
    expect(result!.previousPeriod.coefficientOfVariation).toBe(0)
    // Current period: 100, 120 → CV > 0
    expect(result!.currentPeriod.coefficientOfVariation).toBeGreaterThan(0)
    expect(result!.cvChange).toBeGreaterThan(0)
  })
})
