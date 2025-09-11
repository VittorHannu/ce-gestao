import React from 'react';
import { Button } from '@/01-shared/components/ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
          <div className="max-w-md">
            <h1 className="text-2xl font-bold text-destructive mb-4">Oops! Algo deu errado.</h1>
            <p className="text-muted-foreground mb-6">
              Nossa equipe foi notificada. Por favor, tente recarregar a página ou voltar mais tarde.
            </p>
            <details className="mb-6 bg-slate-100 dark:bg-slate-800 p-2 rounded">
              <summary className="cursor-pointer text-sm">Detalhes do erro</summary>
              <pre className="mt-2 text-xs text-left whitespace-pre-wrap">
                {this.state.error?.message}
              </pre>
            </details>
            <Button onClick={() => window.location.reload()}>
              Recarregar a Página
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
