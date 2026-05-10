import { describe, it, expect } from 'vitest'
import { CalculateTimeInRange } from '../../src/application/CalculateTimeInRange'
import { GlucoseReading } from '../../src/domain/models/GlucoseReading'

function makeReading(value: number, hoursAgo: number = 0): GlucoseReading {
  return {
    timestamp: new Date(Date.now() - hoursAgo * 3600000),
    value,
    units: 'mg/dL',
  }
}

describe('CalculateTimeInRange', () => {
  it('returns percentage 0 for empty readings', async () => {
    const calc = new CalculateTimeInRange()
    const result = await calc.execute([])
    expect(result.percentage).toBe(0)
    expect(result.low).toBe(70)
    expect(result.high).toBe(180)
  })

  it('returns 100% when all readings are in range', async () => {
    const calc = new CalculateTimeInRange()
    const readings = [
      makeReading(100),
      makeReading(120),
      makeReading(150),
      makeReading(70),
      makeReading(180),
    ]
    const result = await calc.execute(readings)
    expect(result.percentage).toBe(100)
  })

  it('returns 0% when all readings are out of range', async () => {
    const calc = new CalculateTimeInRange()
    const readings = [
      makeReading(50),
      makeReading(60),
      makeReading(200),
      makeReading(300),
    ]
    const result = await calc.execute(readings)
    expect(result.percentage).toBe(0)
  })

  it('returns correct percentage for mixed readings', async () => {
    const calc = new CalculateTimeInRange()
    const readings = [
      makeReading(100),
      makeReading(50),
      makeReading(150),
      makeReading(200),
    ]
    const result = await calc.execute(readings)
    expect(result.percentage).toBe(50)
  })

  it('handles single reading in range', async () => {
    const calc = new CalculateTimeInRange()
    const readings = [makeReading(100)]
    const result = await calc.execute(readings)
    expect(result.percentage).toBe(100)
  })

  it('handles single reading out of range', async () => {
    const calc = new CalculateTimeInRange()
    const readings = [makeReading(50)]
    const result = await calc.execute(readings)
    expect(result.percentage).toBe(0)
  })

  it('respects boundary values (low=70, high=180)', async () => {
    const calc = new CalculateTimeInRange()
    const readings = [
      makeReading(69),
      makeReading(70),
      makeReading(180),
      makeReading(181),
    ]
    const result = await calc.execute(readings)
    expect(result.percentage).toBe(50)
  })

  it('supports custom thresholds', async () => {
    const calc = new CalculateTimeInRange({ low: 80, high: 160 })
    const readings = [
      makeReading(85),
      makeReading(150),
      makeReading(70),
      makeReading(200),
    ]
    const result = await calc.execute(readings)
    expect(result.percentage).toBe(50)
    expect(result.low).toBe(80)
    expect(result.high).toBe(160)
  })
})
