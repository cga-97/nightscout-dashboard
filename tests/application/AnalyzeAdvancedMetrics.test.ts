import { describe, it, expect } from 'vitest'
import { AnalyzeAdvancedMetrics } from '../../src/application/AnalyzeAdvancedMetrics'
import { GlucoseReading } from '../../src/domain/models/GlucoseReading'

function makeReading(value: number, hoursAgo: number = 0): GlucoseReading {
  return {
    timestamp: new Date(Date.now() - hoursAgo * 3600000),
    value,
    units: 'mg/dL',
  }
}

describe('AnalyzeAdvancedMetrics', () => {
  it('returns null for empty readings', () => {
    const analyzer = new AnalyzeAdvancedMetrics()
    const result = analyzer.execute([])
    expect(result).toBeNull()
  })

  it('calculates complete metrics for a single reading', () => {
    const analyzer = new AnalyzeAdvancedMetrics()
    const result = analyzer.execute([makeReading(120)])
    expect(result).not.toBeNull()
    expect(result!.totalReadings).toBe(1)
    expect(result!.tirPercentage).toBe(100)
    expect(result!.averageGlucose).toBe(120)
    expect(result!.gmiPercentage).toBeCloseTo(3.31 + 0.02392 * 120, 2)
    expect(result!.coefficientOfVariation).toBe(0)
    expect(result!.lowThreshold).toBe(70)
    expect(result!.highThreshold).toBe(180)
  })

  it('calculates all sub-metrics correctly', () => {
    const analyzer = new AnalyzeAdvancedMetrics()
    const readings = [
      makeReading(40),   // TBR2 + TBR1
      makeReading(65),   // TBR1
      makeReading(100),  // TIR
      makeReading(200),  // TAR1
      makeReading(300),  // TAR2 + TAR1
    ]
    const result = analyzer.execute(readings)
    expect(result!.tirPercentage).toBe(20)
    expect(result!.tbrLevel1Percentage).toBe(40)
    expect(result!.tbrLevel2Percentage).toBe(20)
    expect(result!.tarLevel1Percentage).toBe(20)
    expect(result!.tarLevel2Percentage).toBe(20)
  })

  it('calculates average glucose and GMI', () => {
    const analyzer = new AnalyzeAdvancedMetrics()
    const readings = [
      makeReading(100),
      makeReading(200),
    ]
    const result = analyzer.execute(readings)
    expect(result!.averageGlucose).toBe(150)
    expect(result!.gmiPercentage).toBeCloseTo(3.31 + 0.02392 * 150, 2)
  })

  it('calculates coefficient of variation', () => {
    const analyzer = new AnalyzeAdvancedMetrics()
    const readings = [
      makeReading(100),
      makeReading(120),
    ]
    const result = analyzer.execute(readings)
    expect(result!.coefficientOfVariation).toBeGreaterThan(0)
    expect(result!.coefficientOfVariation).toBeCloseTo(9.09, 1)
  })

  it('handles custom thresholds', () => {
    const analyzer = new AnalyzeAdvancedMetrics({ low: 80, high: 160 })
    const readings = [
      makeReading(75),   // TBR1
      makeReading(100),  // TIR
      makeReading(200),  // TAR1
    ]
    const result = analyzer.execute(readings)
    expect(result!.tirPercentage).toBeCloseTo(33.33, 1)
    expect(result!.tbrLevel1Percentage).toBeCloseTo(33.33, 1)
    expect(result!.tarLevel1Percentage).toBeCloseTo(33.33, 1)
    expect(result!.lowThreshold).toBe(80)
    expect(result!.highThreshold).toBe(160)
  })
})
