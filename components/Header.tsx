'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

type User = {
  id: number;
  name: string | null;
  role: string;
};

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/profile/me', { credentials: 'include' })
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    router.push('/');
  }

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-semibold">
          ClipConnect
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/explore"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Explore
          </Link>
          {user?.role === 'PRO' && (
            <Link
              href="/create-post"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Create
            </Link>
          )}
          {user && (
            <Link
              href="/saved"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Saved
            </Link>
          )}
          {loading ? (
            <span className="text-sm text-gray-400">...</span>
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link
                href={`/profiles/${user.id}`}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {user.name || 'Profile'}
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-50"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link href="/signin" className="inline-block">
              <span className="px-3 py-1 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700">
                Sign in
              </span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
