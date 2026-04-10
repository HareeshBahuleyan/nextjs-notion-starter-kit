const CONSENT_KEY = 'cookie_consent'

export type ConsentValue = 'accepted' | 'declined' | null

export function getConsent(): ConsentValue {
  if (typeof window === 'undefined') return null
  const val = localStorage.getItem(CONSENT_KEY)
  if (val === 'accepted' || val === 'declined') return val
  return null
}

export function setConsent(value: 'accepted' | 'declined'): void {
  localStorage.setItem(CONSENT_KEY, value)
}

export function hasAnswered(): boolean {
  return getConsent() !== null
}
