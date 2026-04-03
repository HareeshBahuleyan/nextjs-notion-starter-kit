import * as React from 'react'
import { posthog } from 'posthog-js'

import { posthogId } from '@/lib/config'

import { ErrorPage } from './ErrorPage'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (posthogId) {
      posthog.captureException(error, {
        componentStack: info.componentStack
      })
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage statusCode={500} />
    }

    return this.props.children
  }
}
