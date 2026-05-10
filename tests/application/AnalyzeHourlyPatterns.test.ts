import { describe, it, expect } from 'vitest'
import { AnalyzeHourlyPatterns } from '../../src/application/AnalyzeHourlyPatterns'
import { GlucoseReading } from '../../src/domain/models/GlucoseReading'

function makeReadingAt(value: number, dateStr: string, hour: number): GlucoseReading {
  const d = new Date(dateStr)
  d.setHours(hour, 0, 0, 0)
  return { timestamp: d, value, units: 'mg/dL' }
}

describe('AnalyzeHourlyPatterns', () => {
  it('returns all 6 blocks with zero values for empty readings', () => {
    const analyzer = new AnalyzeHourlyPatterns()
    const result = analyzer.execute([])
    expect(result).toHaveLength(6)
    result.forEach((block) => {
      expect(block.averageGlucose).toBe(0)
      expect(block.readingsCount).toBe(0)
      expect(block.timeInRangePercentage).toBe(0)
    })
  })

  it('places readings into correct hour blocks', () => {
    const analyzer = new AnalyzeHourlyPatterns()
    const readings = [
      makeReadingAt(100, '2026-05-10', 2),  // block 0-4
      makeReadingAt(120, '2026-05-10', 6),  // block 4-8
      makeReadingAt(140, '2026-05-10', 10), // block 8-12
      makeReadingAt(160, '2026-05-10', 14), // block 12-16
      makeReadingAt(180, '2026-05-10', 18), // block 16-20
      makeReadingAt(200, '2026-05-10', 22), // block 20-24
    ]
    const result = analyzer.execute(readings)

    const block0to4 = result.find((b) => b.hourStart === 0)
    expect(block0to4!.readingsCount).toBe(1)
    expect(block0to4!.averageGlucose).toBe(100)

    const block4to8 = result.find((b) => b.hourStart === 4)
    expect(block4to8!.readingsCount).toBe(1)
    expect(block4to8!.averageGlucose).toBe(120)

    const block20to24 = result.find((b) => b.hourStart === 20)
    expect(block20to24!.readingsCount).toBe(1)
    expect(block20to24!.averageGlucose).toBe(200)
  })

  it('averages multiple readings in the same block', () => {
    const analyzer = new AnalyzeHourlyPatterns()
    const readings = [
      makeReadingAt(100, '2026-05-10', 2),
      makeReadingAt(200, '2026-05-10', 3),
    ]
    const result = analyzer.execute(readings)
    const block = result.find((b) => b.hourStart === 0)
    expect(block!.readingsCount).toBe(2)
    expect(block!.averageGlucose).toBe(150)
  })

  it('calculates timeInRangePercentage for each block', () => {
    const analyzer = new AnalyzeHourlyPatterns()
    const readings = [
      makeReadingAt(50, '2026-05-10', 2),   // out
      makeReadingAt(100, '2026-05-10', 2),  // in
      makeReadingAt(100, '2026-05-10', 10), // in
    ]
    const result = analyzer.execute(readings)
    const block0to4 = result.find((b) => b.hourStart === 0)
    expect(block0to4!.timeInRangePercentage).toBe(50)

    const block8to12 = result.find((b) => b.hourStart === 8)
    expect(block8to12!.timeInRangePercentage).toBe(100)
  })

  it('returns correct block boundaries', () => {
    const analyzer = new AnalyzeHourlyPatterns()
    const result = analyzer.execute([])
    const expectedBlocks = [
      { hourStart: 0, hourEnd: 4 },
      { hourStart: 4, hourEnd: 8 },
      { hourStart: 8, hourEnd: 12 },
      { hourStart: 12, hourEnd: 16 },
      { hourStart: 16, hourEnd: 20 },
      { hourStart: 20, hourEnd: 24 },
    ]
    result.forEach((block, i) => {
      expect(block.hourStart).toBe(expectedBlocks[i].hourStart)
      expect(block.hourEnd).toBe(expectedBlocks[i].hourEnd)
    })
  })

  it('handles custom thresholds', () => {
    const analyzer = new AnalyzeHourlyPatterns({ low: 80, high: 160 })
    const readings = [
      makeReadingAt(70, '2026-05-10', 2),   // out (low)
      makeReadingAt(100, '2026-05-10', 2),  // in
    ]
    const result = analyzer.execute(readings)
    const block = result.find((b) => b.hourStart === 0)
    expect(block!.timeInRangePercentage).toBe(50)
  })
})
