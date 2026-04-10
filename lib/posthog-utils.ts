import { posthog } from 'posthog-js'

import { posthogId } from './config'

export function track4xxError(
  statusCode: number,
  {
    path,
    url,
    method,
    message,
    source
  }: {
    path?: string
    url?: string
    method?: string
    message?: string
    source: 'fetch' | 'page'
  }
) {
  if (!posthogId || statusCode < 400 || statusCode >= 500) {
    return
  }

  const error = new Error(message || `HTTP ${statusCode}`)
  error.name = 'HttpClientError'

  posthog.captureException(error, {
    statusCode,
    errorCategory: '4xx_client_error',
    source,
    path,
    url,
    method
  })
}

type TrackedWindow = Window & {
  __posthogFetch4xxTrackingInstalled__?: boolean
}

export function installFetch4xxTracking() {
  if (typeof window === 'undefined' || !posthogId) {
    return
  }

  const trackedWindow = window as TrackedWindow
  if (trackedWindow.__posthogFetch4xxTrackingInstalled__) {
    return
  }

  trackedWindow.__posthogFetch4xxTrackingInstalled__ = true

  const originalFetch = window.fetch.bind(window)
  window.fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> => {
    const response = await originalFetch(input, init)
    const url = getRequestUrl(input)

    if (
      url &&
      isSameOrigin(url) &&
      response.status >= 400 &&
      response.status < 500
    ) {
      track4xxError(response.status, {
        source: 'fetch',
        path: new URL(url, window.location.origin).pathname,
        url,
        method: getRequestMethod(input, init),
        message: `HTTP ${response.status} for ${getRequestMethod(input, init)} ${url}`
      })
    }

    return response
  }
}

function getRequestMethod(input: RequestInfo | URL, init?: RequestInit) {
  if (init?.method) {
    return init.method.toUpperCase()
  }

  if (typeof Request !== 'undefined' && input instanceof Request) {
    return input.method.toUpperCase()
  }

  return 'GET'
}

function getRequestUrl(input: RequestInfo | URL) {
  if (typeof input === 'string') {
    return new URL(input, window.location.origin).toString()
  }

  if (input instanceof URL) {
    return input.toString()
  }

  if (typeof Request !== 'undefined' && input instanceof Request) {
    return input.url
  }

  return undefined
}

function isSameOrigin(url: string) {
  return new URL(url, window.location.origin).origin === window.location.origin
}
