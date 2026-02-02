import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ui/ConfirmDialog';

interface User {
  id: number;
  name: string | null;
  profilePhotoUrl: string | null;
  email: string;
  professional?: {
    shopName: string | null;
    shopAddress: string | null;
  } | null;
}

interface Booking {
  id: number;
  clientId: number;
  professionalId: number;
  scheduledAt: string;
  duration: number;
  status: string;
  notes: string | null;
  createdAt: string;
  client: User;
  professional: User;
}

type ViewRole = 'client' | 'professional';
type StatusFilter = 'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-800',
};

export default function BookingsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewRole, setViewRole] = useState<ViewRole>('client');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.append('role', viewRole);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await fetch(`/api/bookings?${params}`, {
        credentials: 'include',
      });

      if (res.status === 401) {
        router.push('/signin');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings);
      }
    } catch {
      showToast('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  }, [viewRole, statusFilter, router, showToast]);

  // Fetch user role
  useEffect(() => {
    fetch('/api/profile/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.role) {
          setUserRole(data.role);
          if (data.role === 'PRO') {
            setViewRole('professional');
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  async function updateBookingStatus(id: number, status: string) {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        const updated = await res.json();
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: updated.status } : b))
        );
        showToast(`Booking ${status}`, 'success');
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to update booking', 'error');
      }
    } catch {
      showToast('Failed to update booking', 'error');
    }
  }

  async function handleConfirm(id: number) {
    const confirmed = await confirm({
      title: 'Confirm Booking',
      message: 'Are you sure you want to confirm this booking?',
      confirmText: 'Confirm',
      variant: 'info',
    });
    if (confirmed) {
      await updateBookingStatus(id, 'confirmed');
    }
  }

  async function handleCancel(id: number) {
    const confirmed = await confirm({
      title: 'Cancel Booking',
      message: 'Are you sure you want to cancel this booking? This action cannot be undone.',
      confirmText: 'Cancel Booking',
      variant: 'danger',
    });
    if (confirmed) {
      await updateBookingStatus(id, 'cancelled');
    }
  }

  async function handleComplete(id: number) {
    const confirmed = await confirm({
      title: 'Complete Booking',
      message: 'Mark this booking as completed?',
      confirmText: 'Complete',
      variant: 'info',
    });
    if (confirmed) {
      await updateBookingStatus(id, 'completed');
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  function formatDuration(minutes: number) {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Bookings | ClipConnect</title>
        </Head>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-32" />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Bookings | ClipConnect</title>
      </Head>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Bookings</h1>

        {/* Role Toggle (for PRO users) */}
        {userRole === 'PRO' && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setViewRole('professional')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewRole === 'professional'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              My Appointments
            </button>
            <button
              onClick={() => setViewRole('client')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewRole === 'client'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Booked as Client
            </button>
          </div>
        )}

        {/* Status Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as StatusFilter[]).map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            )
          )}
        </div>

        {bookings.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="No bookings found"
            description={
              viewRole === 'professional'
                ? "You don't have any appointments yet. Share your profile to start getting bookings!"
                : "You haven't booked any appointments yet."
            }
            actionLabel={viewRole === 'client' ? 'Find Stylists' : undefined}
            actionHref={viewRole === 'client' ? '/explore' : undefined}
          />
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const otherUser =
                viewRole === 'client' ? booking.professional : booking.client;
              const isPending = booking.status === 'pending';
              const isConfirmed = booking.status === 'confirmed';
              const isPast = new Date(booking.scheduledAt) < new Date();

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* User Info */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                        {otherUser.profilePhotoUrl ? (
                          <img
                            src={otherUser.profilePhotoUrl}
                            alt={otherUser.name || 'User'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
                            {(otherUser.name || 'U')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/profiles/${otherUser.id}`}
                          className="font-medium text-gray-900 hover:text-indigo-600 block truncate"
                        >
                          {otherUser.name || 'Unknown'}
                        </Link>
                        {viewRole === 'client' && otherUser.professional?.shopName && (
                          <p className="text-sm text-gray-500 truncate">
                            {otherUser.professional.shopName}
                          </p>
                        )}
                        <p className="text-sm text-gray-400">{otherUser.email}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>

                  {/* Booking Details */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p className="font-medium">{formatDate(booking.scheduledAt)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Time</p>
                      <p className="font-medium">{formatTime(booking.scheduledAt)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Duration</p>
                      <p className="font-medium">{formatDuration(booking.duration)}</p>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Notes</p>
                      <p className="text-sm text-gray-700">{booking.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {viewRole === 'professional' && isPending && (
                      <>
                        <button
                          onClick={() => handleConfirm(booking.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {viewRole === 'professional' && isConfirmed && !isPast && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                      >
                        Cancel
                      </button>
                    )}

                    {viewRole === 'professional' && isConfirmed && isPast && (
                      <button
                        onClick={() => handleComplete(booking.id)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                      >
                        Mark Complete
                      </button>
                    )}

                    {viewRole === 'client' && (isPending || isConfirmed) && !isPast && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}

                    <Link
                      href={`/messages/${otherUser.id}`}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Message
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
