// used for rendering equations (optional)
import 'katex/dist/katex.min.css'
// used for code syntax highlighting (optional)
import 'prismjs/themes/prism-coy.css'
// core styles shared by all of react-notion-x (required)
import 'react-notion-x/styles.css'
// global styles shared across the entire site
import 'styles/global.css'
// this might be better for dark mode
// import 'prismjs/themes/prism-okaidia.css'
// global style overrides for notion
import 'styles/notion.css'
// global style overrides for prism theme (optional)
import 'styles/prism-theme.css'

import type { AppProps } from 'next/app'
import { Analytics } from '@vercel/analytics/next'
import * as Fathom from 'fathom-client'
import { useRouter } from 'next/router'
import { posthog } from 'posthog-js'
import * as React from 'react'

import { CookieBanner } from '@/components/CookieBanner'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { bootstrap } from '@/lib/bootstrap-client'
import {
  fathomConfig,
  fathomId,
  isServer,
  posthogConfig,
  posthogId
} from '@/lib/config'
import { getConsent } from '@/lib/cookie-consent'
import { installFetch4xxTracking } from '@/lib/posthog-utils'

if (!isServer) {
  bootstrap()
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [analyticsEnabled, setAnalyticsEnabled] = React.useState(false)

  // On mount, check if user has already accepted analytics consent
  React.useEffect(() => {
    if (getConsent() === 'accepted') {
      setAnalyticsEnabled(true)
    }
  }, [])

  // Initialise analytics tools only when consent is granted
  React.useEffect(() => {
    if (!analyticsEnabled) return

    function onRouteChangeComplete() {
      if (fathomId) {
        Fathom.trackPageview()
      }
      if (posthogId) {
        posthog.capture('$pageview')
      }
    }

    if (fathomId) {
      Fathom.load(fathomId, fathomConfig)
    }

    if (posthogId) {
      installFetch4xxTracking()

      posthog.init(posthogId, {
        ...posthogConfig,
        loaded: (ph) => {
          // Opt out of capture if we somehow init without consent
          if (getConsent() !== 'accepted') ph.opt_out_capturing()
        }
      })
    }

    router.events.on('routeChangeComplete', onRouteChangeComplete)

    return () => {
      router.events.off('routeChangeComplete', onRouteChangeComplete)
    }
  }, [analyticsEnabled, router.events])

  function handleConsent(accepted: boolean) {
    if (accepted) {
      setAnalyticsEnabled(true)
    } else if (posthogId && posthog.__loaded) {
      posthog.opt_out_capturing()
    }
  }

  return (
    <>
      <ErrorBoundary resetKey={router.asPath}>
        <Component {...pageProps} />
      </ErrorBoundary>
      {analyticsEnabled && <Analytics />}
      <CookieBanner onConsent={handleConsent} />
    </>
  )
}
