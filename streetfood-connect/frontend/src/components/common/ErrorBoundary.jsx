import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-lg mx-auto text-center">
          <div className="mb-4 text-red-500">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">We've noted the problem and will fix it soon.</p>
          <button 
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook to throw errors outside of React lifecycle (e.g., in async callbacks)
export function useErrorBoundary() {
  return {
    showBoundary: (error) => {
      throw error;
    }
  };
}
