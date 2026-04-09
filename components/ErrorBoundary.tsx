import { posthog } from 'posthog-js'
import * as React from 'react'

import { posthogId } from '@/lib/config'

import { ErrorPage } from './ErrorPage'

interface Props {
  children: React.ReactNode
  resetKey?: string
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

  override componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false })
    }
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (posthogId) {
      posthog.captureException(error, {
        componentStack: info.componentStack
      })
    }
  }

  override render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          statusCode={500}
          skipCapture
          onReset={() => this.setState({ hasError: false })}
        />
      )
    }

    return this.props.children
  }
}
