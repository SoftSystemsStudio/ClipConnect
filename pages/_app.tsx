import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Header from '../components/Header';
import { ToastProvider } from '../components/Toast';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container py-8 flex-1">
          <Component {...pageProps} />
        </div>
      </div>
    </ToastProvider>
  );
}
