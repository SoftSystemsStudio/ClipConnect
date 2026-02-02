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
  const [unreadCount, setUnreadCount] = useState(0);
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
        if (data) {
          // Fetch unread notification count
          fetch('/api/notifications?limit=1', { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : null))
            .then((notifData) => {
              if (notifData?.unreadCount) {
                setUnreadCount(notifData.unreadCount);
              }
            })
            .catch(() => {});
        }
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
            <>
              <Link
                href="/saved"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Saved
              </Link>
              <Link
                href="/bookings"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Bookings
              </Link>
              <Link
                href="/notifications"
                className="relative text-sm text-gray-600 hover:text-gray-900"
              >
                Notifications
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <Link
                href="/messages"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Messages
              </Link>
            </>
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
              <Link
                href="/profile/edit"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Edit
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
