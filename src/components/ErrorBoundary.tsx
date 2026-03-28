import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-8 font-mono">
          <div className="max-w-2xl w-full bg-slate-800 border border-red-500/30 p-8 rounded shadow-2xl">
            <h1 className="text-2xl font-black text-red-500 mb-4 flex items-center gap-3">
              <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">FATAL</span>
              System Error
            </h1>
            <div className="bg-slate-950 p-4 rounded border border-slate-700 overflow-x-auto mb-6">
              <pre className="text-sm text-red-400 whitespace-pre-wrap">
                {this.state.error?.message || 'An unexpected error occurred.'}
              </pre>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white text-slate-900 font-bold uppercase text-sm hover:bg-slate-200 transition-colors w-full"
            >
              Reboot System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
