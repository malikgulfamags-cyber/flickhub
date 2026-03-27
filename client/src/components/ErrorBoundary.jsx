import React from 'react';
import {  useNavigate } from 'react-router-dom';


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }
  

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="text-red-500 text-6xl mb-4 ">⚠️</div>
            <h2 className="text-white text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-6">
              We're sorry, but an unexpected error occurred. Please try refreshing the page.
            </p>
            <div className="flex justify-between">
                <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
            >
              Refresh Page
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
            >
              Home Page
            </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;