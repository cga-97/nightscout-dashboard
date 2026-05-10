import { describe, it, expect } from 'vitest'
import { CalculateWeeklyComparison } from '../../src/application/CalculateWeeklyComparison'
import { GlucoseReading } from '../../src/domain/models/GlucoseReading'

function makeReadingAt(value: number, date: Date): GlucoseReading {
  return { timestamp: date, value, units: 'mg/dL' }
}

describe('CalculateWeeklyComparison', () => {
  it('returns empty array for empty readings', () => {
    const calc = new CalculateWeeklyComparison()
    const result = calc.execute([])
    expect(result).toEqual([])
  })

  it('returns single week metrics', () => {
    const calc = new CalculateWeeklyComparison()
    const monday = new Date('2026-05-04T10:00:00Z') // Monday
    const tuesday = new Date('2026-05-05T10:00:00Z')
    const readings = [
      makeReadingAt(100, monday),
      makeReadingAt(120, tuesday),
      makeReadingAt(60, monday),
      makeReadingAt(200, tuesday),
    ]
    const result = calc.execute(readings)
    expect(result).toHaveLength(1)
    const week = result[0]
    expect(week.totalReadings).toBe(4)
    expect(week.averageGlucose).toBe(120)
    expect(week.tirPercentage).toBe(50)
    expect(week.coefficientOfVariation).toBeGreaterThan(0)
  })

  it('returns multiple weeks sorted by start date', () => {
    const calc = new CalculateWeeklyComparison()
    const week1 = new Date('2026-04-27T10:00:00Z') // Monday
    const week2 = new Date('2026-05-04T10:00:00Z') // Next Monday
    const readings = [
      makeReadingAt(100, week1),
      makeReadingAt(150, week2),
    ]
    const result = calc.execute(readings)
    expect(result).toHaveLength(2)
    expect(result[0].weekStart.getTime()).toBeLessThan(result[1].weekStart.getTime())
  })

  it('calculates TBR and TAR percentages', () => {
    const calc = new CalculateWeeklyComparison()
    const monday = new Date('2026-05-04T10:00:00Z')
    const readings = [
      makeReadingAt(40, monday),   // severe hypo (< 54) + hypo (< 70)
      makeReadingAt(65, monday),   // hypo (< 70), NOT severe
      makeReadingAt(100, monday),  // in range
      makeReadingAt(200, monday),  // TAR1 (180-250)
      makeReadingAt(300, monday),  // severe hyper (> 250) + hyper (> 180)
    ]
    const result = calc.execute(readings)
    expect(result).toHaveLength(1)
    const week = result[0]
    expect(week.tirPercentage).toBe(20)         // 1/5 in range
    expect(week.tbrLevel1Percentage).toBe(40)   // 2/5 < 70
    expect(week.tbrLevel2Percentage).toBe(20)   // 1/5 < 54
    expect(week.tarLevel1Percentage).toBe(20)   // 1/5 180-250
    expect(week.tarLevel2Percentage).toBe(20)   // 1/5 > 250
    expect(week.severeHypoCount).toBe(1)
    expect(week.severeHyperCount).toBe(1)
  })

  it('correctly groups by ISO week starting Monday', () => {
    const calc = new CalculateWeeklyComparison()
    // Sunday and Monday should end up in different weeks
    const sunday = new Date('2026-05-10T10:00:00Z') // Sunday
    const monday = new Date('2026-05-11T10:00:00Z') // Monday (next week)
    const readings = [
      makeReadingAt(100, sunday),
      makeReadingAt(120, monday),
    ]
    const result = calc.execute(readings)
    expect(result).toHaveLength(2)
  })

  it('handles custom thresholds', () => {
    const calc = new CalculateWeeklyComparison({ low: 80, high: 160 })
    const monday = new Date('2026-05-04T10:00:00Z')
    const readings = [
      makeReadingAt(75, monday),   // below custom low (80)
      makeReadingAt(100, monday),  // in range
      makeReadingAt(200, monday),  // above custom high (160)
    ]
    const result = calc.execute(readings)
    expect(result[0].tirPercentage).toBeCloseTo(33.33, 1)
    expect(result[0].tbrLevel1Percentage).toBeCloseTo(33.33, 1)
  })
})
