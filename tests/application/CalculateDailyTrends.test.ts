import { describe, it, expect } from 'vitest'
import { CalculateDailyTrends } from '../../src/application/CalculateDailyTrends'
import { GlucoseReading } from '../../src/domain/models/GlucoseReading'

function makeReading(value: number, hoursAgo: number = 0): GlucoseReading {
  return {
    timestamp: new Date(Date.now() - hoursAgo * 3600000),
    value,
    units: 'mg/dL',
  }
}

function makeReadingAt(value: number, dateStr: string, hour: number): GlucoseReading {
  const d = new Date(dateStr)
  d.setHours(hour, 0, 0, 0)
  return { timestamp: d, value, units: 'mg/dL' }
}

describe('CalculateDailyTrends', () => {
  it('returns empty array for empty readings', () => {
    const calc = new CalculateDailyTrends()
    const result = calc.execute([])
    expect(result).toEqual([])
  })

  it('returns single day trend', () => {
    const calc = new CalculateDailyTrends()
    const readings = [
      makeReadingAt(100, '2026-05-10', 10),
      makeReadingAt(200, '2026-05-10', 14),
    ]
    const result = calc.execute(readings)
    expect(result).toHaveLength(1)
    expect(result[0].averageGlucose).toBe(150)
    expect(result[0].tirPercentage).toBe(50)
    expect(result[0].readingsCount).toBe(2)
  })

  it('returns multiple days sorted by date', () => {
    const calc = new CalculateDailyTrends()
    const readings = [
      makeReadingAt(100, '2026-05-10', 10),
      makeReadingAt(120, '2026-05-10', 14),
      makeReadingAt(80, '2026-05-08', 10),
      makeReadingAt(90, '2026-05-08', 14),
      makeReadingAt(150, '2026-05-09', 10),
    ]
    const result = calc.execute(readings)
    expect(result).toHaveLength(3)
    expect(result[0].date.getTime()).toBe(new Date('2026-05-08').getTime())
    expect(result[1].date.getTime()).toBe(new Date('2026-05-09').getTime())
    expect(result[2].date.getTime()).toBe(new Date('2026-05-10').getTime())
  })

  it('calculates correct tirPercentage per day', () => {
    const calc = new CalculateDailyTrends()
    const readings = [
      makeReadingAt(50, '2026-05-10', 10),   // out of range (low)
      makeReadingAt(100, '2026-05-10', 14),  // in range
      makeReadingAt(200, '2026-05-10', 16),  // out of range (high)
    ]
    const result = calc.execute(readings)
    expect(result).toHaveLength(1)
    expect(result[0].tirPercentage).toBeCloseTo(33.33, 1)
    expect(result[0].averageGlucose).toBeCloseTo(116.67, 1)
    expect(result[0].readingsCount).toBe(3)
  })

  it('handles custom thresholds', () => {
    const calc = new CalculateDailyTrends({ low: 80, high: 160 })
    const readings = [
      makeReadingAt(70, '2026-05-10', 10),   // out (low)
      makeReadingAt(100, '2026-05-10', 14),  // in
      makeReadingAt(200, '2026-05-10', 16),  // out (high)
    ]
    const result = calc.execute(readings)
    expect(result[0].tirPercentage).toBeCloseTo(33.33, 1)
  })
})
