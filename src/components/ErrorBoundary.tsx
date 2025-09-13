import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Bug, 
  Mail, 
  Github,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      copied: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate a unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send error to monitoring service (e.g., Sentry, LogRocket, etc.)
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, you would send this to your error monitoring service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this.state.errorId
    };

    // Example: Send to your API endpoint
    fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorReport)
    }).catch(err => {
      console.warn('Failed to report error:', err);
    });
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      copied: false
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  private copyErrorDetails = async () => {
    if (!this.state.error || !this.state.errorInfo) return;

    const errorDetails = {
      error: this.state.error.message,
      stack: this.state.error.stack,
      componentStack: this.state.errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      errorId: this.state.errorId
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full space-y-6">
            {/* Main Error Card */}
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <AlertTriangle className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                  Something went wrong
                </CardTitle>
                <p className="text-gray-600 text-lg leading-relaxed">
                  We encountered an unexpected error. Don't worry, our team has been notified.
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Error Status */}
                <div className="flex justify-center">
                  <Badge variant="destructive" className="px-4 py-2 text-sm font-medium">
                    <Bug className="w-4 h-4 mr-2" />
                    Application Error
                  </Badge>
                </div>

                {/* Error ID for support */}
                {this.state.errorId && (
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-500 mb-1">Error ID (for support)</p>
                    <code className="text-sm font-mono text-gray-800 bg-white px-2 py-1 rounded border">
                      {this.state.errorId}
                    </code>
                  </div>
                )}

                {/* Error Details (if enabled) */}
                {this.props.showDetails && this.state.error && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Error Details</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={this.copyErrorDetails}
                        className="flex items-center gap-2"
                      >
                        {this.state.copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy Details
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm font-medium text-red-800 mb-2">
                        {this.state.error.message}
                      </p>
                      {this.state.error.stack && (
                        <pre className="text-xs text-red-700 overflow-auto max-h-32">
                          {this.state.error.stack}
                        </pre>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={this.handleRetry}
                    className="flex-1 flex items-center justify-center gap-2"
                    variant="default"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </Button>
                  
                  <Button
                    onClick={this.handleGoHome}
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    Go Home
                  </Button>
                  
                  <Button
                    onClick={this.handleReload}
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reload Page
                  </Button>
                </div>

                {/* Support Information */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-center text-sm text-gray-500 mb-3">
                    Still having issues? Contact our support team
                  </p>
                  <div className="flex justify-center space-x-4">
                    <a
                      href="mailto:support@lineyield.com"
                      className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Email Support</span>
                    </a>
                    
                    <a
                      href="https://github.com/lineyield/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      <span>Report Issue</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-gray-900">What can you do?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="space-y-2">
                      <div className="font-medium text-gray-800">🔄 Try Again</div>
                      <p>Click "Try Again" to retry the failed operation</p>
                    </div>
                    <div className="space-y-2">
                      <div className="font-medium text-gray-800">🏠 Go Home</div>
                      <p>Return to the main page and start fresh</p>
                    </div>
                    <div className="space-y-2">
                      <div className="font-medium text-gray-800">📧 Contact Support</div>
                      <p>Reach out if the problem persists</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
