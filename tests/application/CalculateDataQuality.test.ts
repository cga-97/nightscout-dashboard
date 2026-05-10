import { describe, it, expect } from 'vitest'
import { CalculateDataQuality } from '../../src/application/CalculateDataQuality'
import { GlucoseReading } from '../../src/domain/models/GlucoseReading'

function makeReading(value: number, hoursAgo: number = 0): GlucoseReading {
  return {
    timestamp: new Date(Date.now() - hoursAgo * 3600000),
    value,
    units: 'mg/dL',
  }
}

describe('CalculateDataQuality', () => {
  it('calculates coverage for empty readings', () => {
    const calc = new CalculateDataQuality()
    const result = calc.execute([], 24)
    expect(result.expectedReadings).toBe(288) // 24 * 12
    expect(result.actualReadings).toBe(0)
    expect(result.coveragePercentage).toBe(0)
  })

  it('calculates expected readings based on hours * 12', () => {
    const calc = new CalculateDataQuality()
    const readings = [
      makeReading(100),
      makeReading(120),
    ]
    const result = calc.execute(readings, 1)
    expect(result.expectedReadings).toBe(12)
    expect(result.actualReadings).toBe(2)
    expect(result.coveragePercentage).toBeCloseTo(16.67, 1)
  })

  it('returns 100% coverage when actual meets expected', () => {
    const calc = new CalculateDataQuality()
    const readings = Array.from({ length: 24 }, (_, i) => makeReading(100, i * 0.5))
    const result = calc.execute(readings, 2)
    expect(result.expectedReadings).toBe(24)
    expect(result.actualReadings).toBe(24)
    expect(result.coveragePercentage).toBe(100)
  })

  it('caps coverage at 100% when actual exceeds expected', () => {
    const calc = new CalculateDataQuality()
    const readings = Array.from({ length: 30 }, (_, i) => makeReading(100, i * 0.5))
    const result = calc.execute(readings, 2)
    expect(result.coveragePercentage).toBe(100)
  })

  it('returns 0% when hours is 0', () => {
    const calc = new CalculateDataQuality()
    const result = calc.execute([], 0)
    expect(result.expectedReadings).toBe(0)
    expect(result.coveragePercentage).toBe(0)
  })

  it('rounds expected readings for non-integer hours', () => {
    const calc = new CalculateDataQuality()
    const result = calc.execute([], 1.5)
    expect(result.expectedReadings).toBe(18) // Math.round(1.5 * 12) = 18
  })
})
