import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Header from '../components/Header';
import { ToastProvider } from '../components/Toast';
import { ConfirmProvider } from '../components/ui/ConfirmDialog';
import { ErrorBoundary } from '../components/ErrorBoundary';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ConfirmProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <div className="container py-8 flex-1">
              <Component {...pageProps} />
            </div>
          </div>
        </ConfirmProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
