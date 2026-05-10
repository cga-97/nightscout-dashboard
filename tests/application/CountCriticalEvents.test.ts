import { describe, it, expect } from 'vitest'
import { CountCriticalEvents } from '../../src/application/CountCriticalEvents'
import { GlucoseReading } from '../../src/domain/models/GlucoseReading'

function makeReading(value: number, hoursAgo: number = 0): GlucoseReading {
  return {
    timestamp: new Date(Date.now() - hoursAgo * 3600000),
    value,
    units: 'mg/dL',
  }
}

describe('CountCriticalEvents', () => {
  it('returns zero counts for empty readings', () => {
    const calc = new CountCriticalEvents()
    const result = calc.execute([])
    expect(result.hypos).toBe(0)
    expect(result.severeHypos).toBe(0)
    expect(result.hypers).toBe(0)
    expect(result.severeHypers).toBe(0)
  })

  it('returns zero counts when all readings are in range', () => {
    const calc = new CountCriticalEvents()
    const readings = [
      makeReading(70),
      makeReading(100),
      makeReading(150),
      makeReading(180),
    ]
    const result = calc.execute(readings)
    expect(result.hypos).toBe(0)
    expect(result.severeHypos).toBe(0)
    expect(result.hypers).toBe(0)
    expect(result.severeHypers).toBe(0)
  })

  it('correctly counts hypos (<70)', () => {
    const calc = new CountCriticalEvents()
    const readings = [
      makeReading(65),
      makeReading(69),
      makeReading(70),
      makeReading(100),
    ]
    const result = calc.execute(readings)
    expect(result.hypos).toBe(2)
    expect(result.severeHypos).toBe(0)
  })

  it('correctly counts severe hypos (<54)', () => {
    const calc = new CountCriticalEvents()
    const readings = [
      makeReading(40),
      makeReading(53),
      makeReading(54),
      makeReading(100),
    ]
    const result = calc.execute(readings)
    expect(result.severeHypos).toBe(2)
  })

  it('correctly counts hypers (>180)', () => {
    const calc = new CountCriticalEvents()
    const readings = [
      makeReading(181),
      makeReading(200),
      makeReading(180),
    ]
    const result = calc.execute(readings)
    expect(result.hypers).toBe(2)
    expect(result.severeHypers).toBe(0)
  })

  it('correctly counts severe hypers (>250)', () => {
    const calc = new CountCriticalEvents()
    const readings = [
      makeReading(251),
      makeReading(300),
      makeReading(250),
    ]
    const result = calc.execute(readings)
    expect(result.severeHypers).toBe(2)
  })

  it('counts all types independently with mixed readings', () => {
    const calc = new CountCriticalEvents()
    const readings = [
      makeReading(40),  // severe hypo + hypo
      makeReading(65),  // hypo
      makeReading(100), // in range
      makeReading(200), // hyper
      makeReading(300), // severe hyper + hyper
    ]
    const result = calc.execute(readings)
    expect(result.severeHypos).toBe(1)
    expect(result.hypos).toBe(2)
    expect(result.hypers).toBe(2)
    expect(result.severeHypers).toBe(1)
  })

  it('supports custom thresholds', () => {
    const calc = new CountCriticalEvents({ low: 80, high: 160 })
    const readings = [
      makeReading(70),
      makeReading(90),
      makeReading(200),
    ]
    const result = calc.execute(readings)
    expect(result.hypos).toBe(1)  // < 80
    expect(result.hypers).toBe(1) // > 160
  })
})
