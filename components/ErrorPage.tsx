import { posthog } from 'posthog-js'
import * as React from 'react'

import { posthogId } from '@/lib/config'
import { track4xxError } from '@/lib/posthog-utils'

import { PageHead } from './PageHead'
import styles from './styles.module.css'

interface ErrorPageProps {
  statusCode: number
  skipCapture?: boolean
  onReset?: () => void
}

export function ErrorPage({
  statusCode,
  skipCapture,
  onReset
}: ErrorPageProps) {
  const title = 'Error'

  React.useEffect(() => {
    if (posthogId && !skipCapture) {
      track4xxError(statusCode, {
        source: 'page',
        path:
          typeof window !== 'undefined' ? window.location.pathname : undefined,
        message: `HTTP ${statusCode} page error`
      })

      posthog.capture('page_error', {
        statusCode,
        errorType:
          statusCode >= 400 && statusCode < 500
            ? '4xx'
            : statusCode >= 500
              ? '5xx'
              : 'other'
      })
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
            <button
              onClick={onReset}
              style={{ marginTop: '1em', cursor: 'pointer' }}
            >
              Try again
            </button>
          )}

          <img src='/error.png' alt='Error' className={styles.errorImage} />
        </main>
      </div>
    </>
  )
}
