import { describe, it, expect } from 'vitest'
import { CalculateDistributionHistogram } from '../../src/application/CalculateDistributionHistogram'
import { GlucoseReading } from '../../src/domain/models/GlucoseReading'

function makeReading(value: number, hoursAgo: number = 0): GlucoseReading {
  return {
    timestamp: new Date(Date.now() - hoursAgo * 3600000),
    value,
    units: 'mg/dL',
  }
}

describe('CalculateDistributionHistogram', () => {
  it('returns empty bins for empty readings', () => {
    const calc = new CalculateDistributionHistogram()
    const result = calc.execute([])
    expect(result.bins).toEqual([])
    expect(result.totalReadings).toBe(0)
    expect(result.lowThreshold).toBe(70)
    expect(result.highThreshold).toBe(180)
  })

  it('creates bins for all standard ranges', () => {
    const calc = new CalculateDistributionHistogram()
    const readings = [makeReading(100)]
    const result = calc.execute(readings)
    expect(result.totalReadings).toBe(1)
    // Should have 8 standard bins
    expect(result.bins.length).toBeGreaterThanOrEqual(8)
  })

  it('places readings in correct bins', () => {
    const calc = new CalculateDistributionHistogram()
    const readings = [
      makeReading(35),   // <40
      makeReading(50),   // 40-54
      makeReading(60),   // 54-70
      makeReading(85),   // 70-100
      makeReading(120),  // 100-140
      makeReading(160),  // 140-180
      makeReading(200),  // 180-250
      makeReading(300),  // 250-400
    ]
    const result = calc.execute(readings)
    result.bins.forEach((bin) => {
      if (bin.rangeStart === 0 && bin.rangeEnd === 40) expect(bin.count).toBe(1)
      if (bin.rangeStart === 40 && bin.rangeEnd === 54) expect(bin.count).toBe(1)
      if (bin.rangeStart === 54 && bin.rangeEnd === 70) expect(bin.count).toBe(1)
      if (bin.rangeStart === 70 && bin.rangeEnd === 100) expect(bin.count).toBe(1)
      if (bin.rangeStart === 100 && bin.rangeEnd === 140) expect(bin.count).toBe(1)
      if (bin.rangeStart === 140 && bin.rangeEnd === 180) expect(bin.count).toBe(1)
      if (bin.rangeStart === 180 && bin.rangeEnd === 250) expect(bin.count).toBe(1)
      if (bin.rangeStart === 250 && bin.rangeEnd === 400) expect(bin.count).toBe(1)
    })
  })

  it('calculates correct percentages', () => {
    const calc = new CalculateDistributionHistogram()
    const readings = [
      makeReading(100),
      makeReading(100),
      makeReading(200),
      makeReading(300),
    ]
    const result = calc.execute(readings)
    const bin100to140 = result.bins.find((b) => b.rangeStart === 100)
    expect(bin100to140!.count).toBe(2)
    expect(bin100to140!.percentage).toBe(50)

    const bin180to250 = result.bins.find((b) => b.rangeStart === 180)
    expect(bin180to250!.count).toBe(1)
    expect(bin180to250!.percentage).toBe(25)
  })

  it('adds overflow bin for values >= 400', () => {
    const calc = new CalculateDistributionHistogram()
    const readings = [makeReading(450)]
    const result = calc.execute(readings)
    const overflowBin = result.bins.find((b) => b.rangeStart === 400)
    expect(overflowBin).toBeDefined()
    expect(overflowBin!.count).toBe(1)
    expect(overflowBin!.percentage).toBe(100)
    expect(overflowBin!.rangeEnd).toBe(450) // Math.ceil(max)
  })

  it('handles custom thresholds', () => {
    const calc = new CalculateDistributionHistogram({ low: 80, high: 160 })
    const result = calc.execute([makeReading(100)])
    expect(result.lowThreshold).toBe(80)
    expect(result.highThreshold).toBe(160)
  })

  it('does not add overflow bin when no values >= 400', () => {
    const calc = new CalculateDistributionHistogram()
    const readings = [
      makeReading(100),
      makeReading(200),
    ]
    const result = calc.execute(readings)
    const overflowBin = result.bins.find((b) => b.rangeStart >= 400)
    expect(overflowBin).toBeUndefined()
  })
})
