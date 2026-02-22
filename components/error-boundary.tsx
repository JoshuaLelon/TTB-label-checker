/**
 * @design-guard
 * role: Global error boundary that catches React rendering errors and shows fallback UI
 * layer: ui
 * non_goals:
 *   - Error recovery (user refreshes page)
 *   - Catching non-React errors (handled by Next.js error.tsx)
 * boundaries:
 *   depends_on: [lib/logger.ts]
 *   exposes: [ErrorBoundary class component]
 * invariants:
 *   - Catches all React component tree errors below it
 *   - Logs errors with full context
 *   - Never throws from render
 * authority:
 *   decides: [Error display, error logging]
 *   delegates: [Error recovery to user via page refresh]
 * extension_policy: Customize fallback UI by passing fallback prop
 * failure_contract: Error boundary never throws — falls back to basic error message
 * testing_contract: Test error catching, fallback rendering, and logger calls
 * references: [React docs on error boundaries, Next.js error handling]
 */
"use client";

import { Component, type ReactNode } from "react";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error?: Error;
  hasError: boolean;
}

function ErrorFallback({ error }: { error?: Error }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="font-semibold text-2xl">Something went wrong</h1>
      <p className="text-muted-foreground">
        {error?.message ??
          "An unexpected error occurred. Please refresh the page."}
      </p>
      {process.env.NODE_ENV === "development" && error?.stack && (
        <details className="mt-4 w-full max-w-2xl text-left">
          <summary className="cursor-pointer text-muted-foreground text-sm">
            Error details (development only)
          </summary>
          <pre className="mt-2 overflow-auto rounded-lg bg-muted p-4 text-sm">
            {error.stack}
          </pre>
        </details>
      )}
      <button
        className="mt-2 rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm"
        onClick={() => window.location.reload()}
        type="button"
      >
        Refresh Page
      </button>
    </div>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    logger.error("React error boundary caught error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
