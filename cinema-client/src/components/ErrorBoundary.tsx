import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = {
        hasError: false,
        errorMessage: '',
    };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            errorMessage: error.message || 'An unexpected error occurred.',
        };
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        console.error('ErrorBoundary catch:', error, info.componentStack);
    }

    handleReset = () => {
        this.setState({ hasError: false, errorMessage: '' });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-fallback">
                    <h2>Something went wrong</h2>
                    <p>{this.state.errorMessage}</p>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={this.handleReset}
                    >
                        Go to Homepage
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}