import { describe, it, expect, vi, afterEach } from 'vitest'
import { CheckSevereHypo } from '../../src/application/CheckSevereHypo'
import { GlucoseReading } from '../../src/domain/models/GlucoseReading'

function makeReading(value: number, hoursAgo: number = 0): GlucoseReading {
  return {
    timestamp: new Date(Date.now() - hoursAgo * 3600000),
    value,
    units: 'mg/dL',
  }
}

describe('CheckSevereHypo', () => {
  it('returns not triggered for null reading', () => {
    const checker = new CheckSevereHypo()
    const result = checker.execute(null)
    expect(result.triggered).toBe(false)
  })

  it('returns not triggered for normal reading', () => {
    const checker = new CheckSevereHypo()
    const result = checker.execute(makeReading(100))
    expect(result.triggered).toBe(false)
  })

  it('returns not triggered for reading at threshold (54)', () => {
    const checker = new CheckSevereHypo()
    const result = checker.execute(makeReading(54))
    expect(result.triggered).toBe(false)
  })

  it('triggers alert for severe hypo (value < 54)', () => {
    const checker = new CheckSevereHypo()
    const result = checker.execute(makeReading(50))
    expect(result.triggered).toBe(true)
    expect(result.value).toBe(50)
  })

  it('respects cooldown period (second alert within cooldown should not trigger)', () => {
    const checker = new CheckSevereHypo(15) // 15 min cooldown
    const firstResult = checker.execute(makeReading(50))
    expect(firstResult.triggered).toBe(true)

    // Second severe hypo immediately after
    const secondResult = checker.execute(makeReading(40))
    expect(secondResult.triggered).toBe(false)
  })

  it('triggers alert after cooldown expires', async () => {
    const checker = new CheckSevereHypo(0.0001) // very short cooldown (~6ms)
    const firstResult = checker.execute(makeReading(50))
    expect(firstResult.triggered).toBe(true)

    // Wait for cooldown to expire
    await new Promise((r) => setTimeout(r, 10))

    const secondResult = checker.execute(makeReading(40))
    expect(secondResult.triggered).toBe(true)
    expect(secondResult.value).toBe(40)
  })

  it('includes timestamp in alert response', () => {
    const checker = new CheckSevereHypo()
    const reading = makeReading(50)
    const result = checker.execute(reading)
    expect(result.triggered).toBe(true)
    expect(result.timestamp).toEqual(reading.timestamp)
  })
})
