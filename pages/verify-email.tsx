import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;

    const verifyEmail = async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setMessage('Your email has been verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed');
        }
      } catch {
        setStatus('error');
        setMessage('An error occurred. Please try again.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <>
      <Head>
        <title>Verify Email | ClipConnect</title>
      </Head>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <h1 className="mt-6 text-2xl font-bold text-gray-900">Verifying your email...</h1>
              <p className="mt-2 text-gray-600">Please wait while we verify your email address.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="mt-6 text-2xl font-bold text-gray-900">Email Verified!</h1>
              <p className="mt-2 text-gray-600">{message}</p>
              <Link
                href="/explore"
                className="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Start Exploring
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="mt-6 text-2xl font-bold text-gray-900">Verification Failed</h1>
              <p className="mt-2 text-gray-600">{message}</p>
              <Link
                href="/signin"
                className="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
