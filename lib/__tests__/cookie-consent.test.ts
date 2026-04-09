import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getConsent, hasAnswered, setConsent } from '../cookie-consent'

// ---------------------------------------------------------------------------
// localStorage stub — keeps the node test environment but simulates a browser
// ---------------------------------------------------------------------------
function makeLocalStorageMock() {
  const store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k]
    }
  }
}

describe('cookie-consent', () => {
  let localStorageMock: ReturnType<typeof makeLocalStorageMock>

  beforeEach(() => {
    localStorageMock = makeLocalStorageMock()
    // Stub window so the typeof window === 'undefined' guard is bypassed
    vi.stubGlobal('window', {})
    vi.stubGlobal('localStorage', localStorageMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // -------------------------------------------------------------------------
  // getConsent
  // -------------------------------------------------------------------------
  describe('getConsent()', () => {
    it('returns null when nothing has been stored', () => {
      expect(getConsent()).toBeNull()
    })

    it('returns "accepted" after accepting', () => {
      setConsent('accepted')
      expect(getConsent()).toBe('accepted')
    })

    it('returns "declined" after declining', () => {
      setConsent('declined')
      expect(getConsent()).toBe('declined')
    })

    it('returns null for an unrecognised value in storage', () => {
      localStorageMock.setItem('cookie_consent', 'maybe')
      expect(getConsent()).toBeNull()
    })

    it('returns null on the server (window === undefined)', () => {
      vi.stubGlobal('window', undefined)
      expect(getConsent()).toBeNull()
    })
  })

  // -------------------------------------------------------------------------
  // setConsent
  // -------------------------------------------------------------------------
  describe('setConsent()', () => {
    it('persists "accepted" to localStorage', () => {
      setConsent('accepted')
      expect(localStorageMock.getItem('cookie_consent')).toBe('accepted')
    })

    it('persists "declined" to localStorage', () => {
      setConsent('declined')
      expect(localStorageMock.getItem('cookie_consent')).toBe('declined')
    })

    it('overwrites a previous decision', () => {
      setConsent('accepted')
      setConsent('declined')
      expect(getConsent()).toBe('declined')
    })
  })

  // -------------------------------------------------------------------------
  // hasAnswered
  // -------------------------------------------------------------------------
  describe('hasAnswered()', () => {
    it('returns false when no decision has been stored', () => {
      expect(hasAnswered()).toBe(false)
    })

    it('returns true after accepting', () => {
      setConsent('accepted')
      expect(hasAnswered()).toBe(true)
    })

    it('returns true after declining', () => {
      setConsent('declined')
      expect(hasAnswered()).toBe(true)
    })
  })
})
