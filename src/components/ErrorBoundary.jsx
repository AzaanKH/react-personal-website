import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // In production, you could send error to error reporting service
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div 
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'hsl(var(--background))',
            padding: '2rem'
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              maxWidth: '600px',
              width: '100%',
              padding: '3rem',
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '20px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}
          >
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              style={{ marginBottom: '2rem' }}
            >
              <AlertTriangle 
                size={64} 
                style={{ 
                  color: '#ef4444',
                  margin: '0 auto'
                }} 
              />
            </motion.div>

            {/* Error Title */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: 'hsl(var(--foreground))',
                marginBottom: '1rem'
              }}
            >
              Oops! Something went wrong
            </motion.h1>

            {/* Error Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{
                fontSize: '1rem',
                color: 'hsl(var(--muted-foreground))',
                marginBottom: '2rem',
                lineHeight: '1.6'
              }}
            >
              We encountered an unexpected error. Don't worry, your data is safe. 
              You can try refreshing the page or go back to the home page.
            </motion.p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <motion.details
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                  marginBottom: '2rem',
                  padding: '1rem',
                  backgroundColor: 'hsl(var(--muted))',
                  borderRadius: '12px',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  color: 'hsl(var(--muted-foreground))'
                }}
              >
                <summary style={{ 
                  cursor: 'pointer', 
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Error Details (Development Only)
                </summary>
                <pre style={{ 
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '0.75rem',
                  margin: 0
                }}>
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </motion.details>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}
            >
              <motion.button
                onClick={this.handleReset}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: 'white',
                  backgroundColor: '#3b82f6',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                <RefreshCw size={18} />
                Try Again
              </motion.button>

              <motion.button
                onClick={this.handleGoHome}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: 'hsl(var(--foreground))',
                  backgroundColor: 'hsl(var(--secondary))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Home size={18} />
                Go Home
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
