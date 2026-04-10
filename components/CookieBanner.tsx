import * as React from 'react'

import { hasAnswered, setConsent } from '@/lib/cookie-consent'

import styles from './CookieBanner.module.css'

interface CookieBannerProps {
  onConsent: (accepted: boolean) => void
}

export function CookieBanner({ onConsent }: CookieBannerProps) {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    if (!hasAnswered()) {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  function handleAccept() {
    setConsent('accepted')
    setVisible(false)
    onConsent(true)
  }

  function handleDecline() {
    setConsent('declined')
    setVisible(false)
    onConsent(false)
  }

  return (
    <div className={styles.overlay} role='dialog' aria-modal='true' aria-label='Cookie-Zustimmung'>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.icon} aria-hidden='true'>
            🍪
          </span>
          <h2 className={styles.title}>Cookie-Zustimmung verwalten</h2>
          <button
            className={styles.closeBtn}
            onClick={handleDecline}
            aria-label='Schließen'
          >
            ×
          </button>
        </div>

        <p className={styles.body}>
          Um dir ein optimales Erlebnis zu bieten, verwenden wir Technologien wie Cookies, um
          Geräteinformationen zu speichern und/oder darauf zuzugreifen. Wenn du diesen
          Technologien zustimmst, können wir Daten wie das Surfverhalten oder eindeutige IDs
          auf dieser Website verarbeiten. Wenn du deine Zustimmung nicht erteilst oder
          zurückziehst, können bestimmte Merkmale und Funktionen beeinträchtigt werden.
        </p>

        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={handleAccept}>
            Akzeptieren
          </button>
          <button className={styles.btnSecondary} onClick={handleDecline}>
            Ablehnen
          </button>
        </div>

        <div className={styles.links}>
          <a href='/cookies'>Cookie-Richtlinie</a>
          <a href='/datenschutz'>Datenschutzerklärung</a>
          <a href='/impressum'>Impressum</a>
        </div>
      </div>
    </div>
  )
}
