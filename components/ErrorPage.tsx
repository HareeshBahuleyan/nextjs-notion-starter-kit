import { posthog } from 'posthog-js'
import * as React from 'react'

import { posthogId } from '@/lib/config'

import { PageHead } from './PageHead'
import styles from './styles.module.css'

interface ErrorPageProps {
  statusCode: number
  skipCapture?: boolean
  onReset?: () => void
}

export function ErrorPage({ statusCode, skipCapture, onReset }: ErrorPageProps) {
  const title = 'Error'

  React.useEffect(() => {
    if (posthogId && !skipCapture) {
      posthog.capture('page_error', { statusCode })
    }
  }, [statusCode, skipCapture])

  return (
    <>
      <PageHead title={title} />

      <div className={styles.container}>
        <main className={styles.main}>
          <h1>Error Loading Page</h1>

          {statusCode && <p>Error code: {statusCode}</p>}

          {onReset && (
            <button onClick={onReset} style={{ marginTop: '1em', cursor: 'pointer' }}>
              Try again
            </button>
          )}

          <img src='/error.png' alt='Error' className={styles.errorImage} />
        </main>
      </div>
    </>
  )
}
