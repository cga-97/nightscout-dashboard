import { describe, it, expect } from 'vitest'
import { CalculateHourlyHeatmap } from '../../src/application/CalculateHourlyHeatmap'
import { GlucoseReading } from '../../src/domain/models/GlucoseReading'

function makeReadingAt(value: number, dayOfWeek: number, hour: number): GlucoseReading {
  // Sunday May 3, 2026 is a Sunday. May 4 = Monday, May 5 = Tuesday, etc.
  const base = new Date('2026-05-03T00:00:00Z') // Sunday
  const d = new Date(base)
  d.setDate(d.getDate() + dayOfWeek)
  d.setHours(hour, 0, 0, 0)
  return { timestamp: d, value, units: 'mg/dL' }
}

describe('CalculateHourlyHeatmap', () => {
  it('returns empty cells array for empty readings', () => {
    const calc = new CalculateHourlyHeatmap()
    const result = calc.execute([])
    expect(result.cells).toEqual([])
    expect(result.lowThreshold).toBe(70)
    expect(result.highThreshold).toBe(180)
  })

  it('returns 168 cells (7 days x 24 hours) for non-empty readings', () => {
    const calc = new CalculateHourlyHeatmap()
    const readings = [makeReadingAt(100, 0, 0)]
    const result = calc.execute(readings)
    expect(result.cells).toHaveLength(168)
  })

  it('places reading in correct dayOfWeek and hour cell', () => {
    const calc = new CalculateHourlyHeatmap()
    const readings = [
      makeReadingAt(100, 1, 13), // Monday, 1pm
      makeReadingAt(120, 1, 13),
    ]
    const result = calc.execute(readings)
    const cell = result.cells.find((c) => c.dayOfWeek === 1 && c.hour === 13)
    expect(cell).toBeDefined()
    expect(cell!.averageGlucose).toBe(110)
    expect(cell!.readingsCount).toBe(2)
  })

  it('returns NaN average for cells with no readings', () => {
    const calc = new CalculateHourlyHeatmap()
    const readings = [makeReadingAt(100, 0, 0)] // only Sunday midnight
    const result = calc.execute(readings)
    const emptyCell = result.cells.find((c) => c.dayOfWeek === 6 && c.hour === 23)
    expect(emptyCell).toBeDefined()
    expect(emptyCell!.readingsCount).toBe(0)
    expect(emptyCell!.averageGlucose).toBeNaN()
  })

  it('handles custom thresholds', () => {
    const calc = new CalculateHourlyHeatmap({ low: 80, high: 160 })
    const result = calc.execute([makeReadingAt(100, 0, 0)])
    expect(result.lowThreshold).toBe(80)
    expect(result.highThreshold).toBe(160)
  })

  it('groups multiple days into same dayOfWeek-hour cell', () => {
    const calc = new CalculateHourlyHeatmap()
    // Sunday 10am, two different weeks
    const readings = [
      makeReadingAt(100, 0, 10),   // Sunday May 3
    ]
    const sun2 = new Date('2026-05-10T10:00:00Z') // Sunday May 10
    readings.push({ timestamp: sun2, value: 150, units: 'mg/dL' })

    const result = calc.execute(readings)
    const cell = result.cells.find((c) => c.dayOfWeek === 0 && c.hour === 10)
    expect(cell).toBeDefined()
    expect(cell!.readingsCount).toBe(2)
    expect(cell!.averageGlucose).toBe(125)
  })
})
