import { describe, it, expect } from 'vitest'
import { CalculateGMI } from '../../src/application/CalculateGMI'
import { GlucoseReading } from '../../src/domain/models/GlucoseReading'

function makeReading(value: number, hoursAgo: number = 0): GlucoseReading {
  return {
    timestamp: new Date(Date.now() - hoursAgo * 3600000),
    value,
    units: 'mg/dL',
  }
}

describe('CalculateGMI', () => {
  it('returns null for empty readings', () => {
    const calc = new CalculateGMI()
    const result = calc.execute([])
    expect(result).toBeNull()
  })

  it('calculates GMI for a single reading', () => {
    const calc = new CalculateGMI()
    const result = calc.execute([makeReading(150)])
    expect(result).not.toBeNull()
    // 3.31 + 0.02392 * 150 = 3.31 + 3.588 = 6.898
    expect(result!.gmiPercentage).toBeCloseTo(6.898, 2)
    expect(result!.averageGlucose).toBe(150)
  })

  it('calculates GMI using average of multiple readings', () => {
    const calc = new CalculateGMI()
    const readings = [
      makeReading(100),
      makeReading(200),
    ]
    const result = calc.execute(readings)
    // avg = 150, GMI = 3.31 + 0.02392 * 150 = 6.898
    expect(result!.gmiPercentage).toBeCloseTo(6.898, 2)
    expect(result!.averageGlucose).toBe(150)
  })

  it('applies ADA formula correctly: 3.31 + 0.02392 * avg', () => {
    const calc = new CalculateGMI()
    // average of 120
    const result = calc.execute([makeReading(120)])
    // 3.31 + 0.02392 * 120 = 3.31 + 2.8704 = 6.1804
    expect(result!.gmiPercentage).toBeCloseTo(6.1804, 2)
    expect(result!.averageGlucose).toBe(120)
  })

  it('handles very high glucose values', () => {
    const calc = new CalculateGMI()
    const result = calc.execute([makeReading(400)])
    // 3.31 + 0.02392 * 400 = 3.31 + 9.568 = 12.878
    expect(result!.gmiPercentage).toBeCloseTo(12.878, 2)
  })

  it('handles very low glucose values', () => {
    const calc = new CalculateGMI()
    const result = calc.execute([makeReading(40)])
    // 3.31 + 0.02392 * 40 = 3.31 + 0.9568 = 4.2668
    expect(result!.gmiPercentage).toBeCloseTo(4.2668, 2)
  })
})
