import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="max-w-md mx-auto mt-10 p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-xl font-semibold mb-2">Check your email</h2>
          <p className="text-gray-600 mb-4">
            If an account exists for {email}, we&apos;ve sent a password reset link.
          </p>
          <Link href="/signin" className="text-indigo-600 hover:underline">
            Return to sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto mt-10 p-6">
      <h2 className="text-2xl font-semibold mb-2">Forgot password</h2>
      <p className="text-gray-600 mb-6">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="you@example.com"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600">
        Remember your password?{' '}
        <Link href="/signin" className="text-indigo-600">
          Sign in
        </Link>
      </p>
    </main>
  );
}
