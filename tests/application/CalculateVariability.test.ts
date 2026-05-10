import { describe, it, expect } from 'vitest'
import { CalculateVariability } from '../../src/application/CalculateVariability'
import { GlucoseReading } from '../../src/domain/models/GlucoseReading'

function makeReading(value: number, hoursAgo: number = 0): GlucoseReading {
  return {
    timestamp: new Date(Date.now() - hoursAgo * 3600000),
    value,
    units: 'mg/dL',
  }
}

describe('CalculateVariability', () => {
  it('returns NaN values for empty readings', () => {
    const calc = new CalculateVariability()
    const result = calc.execute([])
    expect(result.standardDeviation).toBeNaN()
    expect(result.coefficientOfVariation).toBeNaN()
    expect(result.minGlucose).toBe(0)
    expect(result.maxGlucose).toBe(0)
  })

  it('returns SD 0 for a single reading', () => {
    const calc = new CalculateVariability()
    const result = calc.execute([makeReading(120)])
    expect(result.standardDeviation).toBe(0)
    expect(result.coefficientOfVariation).toBe(0)
    expect(result.minGlucose).toBe(120)
    expect(result.maxGlucose).toBe(120)
  })

  it('returns SD 0 and CV 0 for all identical values', () => {
    const calc = new CalculateVariability()
    const readings = [
      makeReading(100),
      makeReading(100),
      makeReading(100),
    ]
    const result = calc.execute(readings)
    expect(result.standardDeviation).toBe(0)
    expect(result.coefficientOfVariation).toBe(0)
  })

  it('calculates correct SD and CV for known values', () => {
    const calc = new CalculateVariability()
    const readings = [
      makeReading(100),
      makeReading(120),
    ]
    const result = calc.execute(readings)
    // mean = 110, deviations: -10, 10 -> squared sum = 200, variance = 100, SD = 10
    expect(result.standardDeviation).toBeCloseTo(10, 1)
    // CV = (10/110) * 100 ≈ 9.09%
    expect(result.coefficientOfVariation).toBeCloseTo(9.09, 1)
    expect(result.minGlucose).toBe(100)
    expect(result.maxGlucose).toBe(120)
  })

  it('calculates min and max correctly', () => {
    const calc = new CalculateVariability()
    const readings = [
      makeReading(180),
      makeReading(50),
      makeReading(120),
    ]
    const result = calc.execute(readings)
    expect(result.minGlucose).toBe(50)
    expect(result.maxGlucose).toBe(180)
  })

  it('calculates known SD for population stats', () => {
    const calc = new CalculateVariability()
    const readings = [
      makeReading(80),
      makeReading(100),
      makeReading(120),
    ]
    const result = calc.execute(readings)
    // mean = 100, deviations: -20, 0, 20 -> squared sum = 800, variance = 800/3, SD ≈ 16.33
    expect(result.standardDeviation).toBeCloseTo(16.33, 1)
    expect(result.coefficientOfVariation).toBeCloseTo(16.33, 1)
  })
})
