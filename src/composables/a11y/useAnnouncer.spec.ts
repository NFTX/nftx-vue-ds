// src/composables/a11y/useAnnouncer.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAnnouncer } from './useAnnouncer'

describe('useAnnouncer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('announces polite messages with small delay and handles consecutive calls', () => {
    const announcer = useAnnouncer()

    announcer.announce('First polite', 'polite')
    // Consecutive polite call clears previous timer
    announcer.announce('Second polite', 'polite')
    expect(announcer.politeMessage.value).toBe('')

    vi.advanceTimersByTime(60)
    expect(announcer.politeMessage.value).toBe('Second polite')
  })

  it('announces assertive messages for critical alerts and handles consecutive calls', () => {
    const announcer = useAnnouncer()

    announcer.announce('First assertive', 'assertive')
    // Consecutive assertive call clears previous timer
    announcer.announce('Second assertive', 'assertive')
    expect(announcer.assertiveMessage.value).toBe('')

    vi.advanceTimersByTime(60)
    expect(announcer.assertiveMessage.value).toBe('Second assertive')
  })

  it('clears polite timer when only polite is pending', () => {
    const announcer = useAnnouncer()
    announcer.announce('Only polite', 'polite')
    announcer.clear()
    expect(announcer.politeMessage.value).toBe('')
  })

  it('clears assertive timer when only assertive is pending', () => {
    const announcer = useAnnouncer()
    announcer.announce('Only assertive', 'assertive')
    announcer.clear()
    expect(announcer.assertiveMessage.value).toBe('')
  })

  it('clears when both polite and assertive are pending', () => {
    const announcer = useAnnouncer()
    announcer.announce('Polite msg', 'polite')
    announcer.announce('Assertive msg', 'assertive')
    announcer.clear()
    expect(announcer.politeMessage.value).toBe('')
    expect(announcer.assertiveMessage.value).toBe('')
  })

  it('clears when neither timer is pending', () => {
    const announcer = useAnnouncer()
    announcer.clear()
    expect(announcer.politeMessage.value).toBe('')
    expect(announcer.assertiveMessage.value).toBe('')
  })

  it('ignores blank or whitespace messages', () => {
    const announcer = useAnnouncer()
    announcer.announce('')
    announcer.announce('   ')
    vi.advanceTimersByTime(60)
    expect(announcer.politeMessage.value).toBe('')
    expect(announcer.assertiveMessage.value).toBe('')
  })
})
