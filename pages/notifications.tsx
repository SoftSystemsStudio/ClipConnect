import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/Toast';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

const typeIcons: Record<string, string> = {
  follow: '👤',
  like: '❤️',
  comment: '💬',
  review: '⭐',
  message: '✉️',
  booking: '📅',
};

export default function NotificationsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter === 'unread') params.append('unreadOnly', 'true');

      const res = await fetch(`/api/notifications?${params}`, {
        credentials: 'include',
      });

      if (res.status === 401) {
        router.push('/signin');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
        setTotal(data.total);
      }
    } catch {
      showToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  }, [filter, router, showToast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function markAllAsRead() {
    try {
      const res = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ all: true }),
      });

      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        showToast('All notifications marked as read', 'success');
      }
    } catch {
      showToast('Failed to mark notifications as read', 'error');
    }
  }

  async function markAsRead(id: number) {
    try {
      const res = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notificationIds: [id] }),
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // Silent fail for individual marks
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Notifications | ClipConnect</title>
        </Head>
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-20" />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Notifications | ClipConnect</title>
      </Head>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({total})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            icon="notification"
            title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            description={
              filter === 'unread'
                ? "You're all caught up!"
                : "When you get likes, comments, or bookings, they'll show up here."
            }
            actionLabel={filter === 'unread' ? 'View all' : undefined}
            onAction={filter === 'unread' ? () => setFilter('all') : undefined}
          />
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-colors ${
                  notification.isRead
                    ? 'bg-white border-gray-200'
                    : 'bg-indigo-50 border-indigo-200'
                }`}
              >
                {notification.link ? (
                  <Link
                    href={notification.link}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                    className="block"
                  >
                    <NotificationContent notification={notification} formatDate={formatDate} />
                  </Link>
                ) : (
                  <div onClick={() => !notification.isRead && markAsRead(notification.id)}>
                    <NotificationContent notification={notification} formatDate={formatDate} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function NotificationContent({
  notification,
  formatDate,
}: {
  notification: Notification;
  formatDate: (date: string) => string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-2xl">{typeIcons[notification.type] || '🔔'}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900">{notification.title}</p>
          {!notification.isRead && (
            <span className="w-2 h-2 bg-indigo-600 rounded-full" />
          )}
        </div>
        <p className="text-gray-600 text-sm mt-0.5">{notification.message}</p>
        <p className="text-gray-400 text-xs mt-1">{formatDate(notification.createdAt)}</p>
      </div>
    </div>
  );
}
