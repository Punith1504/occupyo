"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", background: "red", color: "white", borderRadius: "8px", margin: "20px" }}>
          <h2>React Render Error Boundary Caught a Crash!</h2>
          <p><strong>Error Message:</strong> {this.state.error && this.state.error.toString()}</p>
          <pre style={{ whiteSpace: "pre-wrap", background: "black", padding: "10px", marginTop: "10px" }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: "10px", padding: "10px", background: "white", color: "red", border: "none", cursor: "pointer" }}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
