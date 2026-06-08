import * as React from 'react'

import styles from './AnnouncementBanner.module.css'

export function AnnouncementBanner() {
  const [dismissed, setDismissed] = React.useState(true)

  React.useEffect(() => {
    const isDismissed =
      localStorage.getItem('blitzgerman-banner-dismissed') === 'true'
    setDismissed(isDismissed)
  }, [])

  const dismiss = () => {
    localStorage.setItem('blitzgerman-banner-dismissed', 'true')
    setDismissed(true)
  }

  if (dismissed) return null

  return (
    <div className={styles.banner} role='banner'>
      <a
        href='https://blitzgerman.com'
        target='_blank'
        rel='noopener noreferrer'
        className={styles.link}
      >
        <span className={styles.text}>
          Looking to practice German grammar? Check out{' '}
          <strong>BlitzGerman.com</strong>
        </span>
        <span className={styles.cta}>Get Early Access →</span>
      </a>
      <button
        className={styles.close}
        onClick={dismiss}
        aria-label='Dismiss banner'
      >
        ✕
      </button>
    </div>
  )
}
