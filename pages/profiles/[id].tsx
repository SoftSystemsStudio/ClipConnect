import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

type Review = {
  id: number;
  rating: number;
  text?: string;
  createdAt: string;
  actualDurationMinutes?: number;
  clientName?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [following, setFollowing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewDuration, setReviewDuration] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/profile/${id}`)
      .then((r) => r.json())
      .then(setProfile);
    fetch('/api/posts')
      .then((r) => r.json())
      .then((all: any[]) => {
        const filtered = all.filter((p) => p.professionalId === Number(id));
        setPosts(filtered);
      });
    fetch(`/api/reviews/pro/${id}`)
      .then((r) => r.json())
      .then(setReviews)
      .catch(() => setReviews([]));
  }, [id]);

  async function toggleFollow() {
    const res = await fetch('/api/follow/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ professionalId: Number(id) }),
    });
    const data = await res.json();
    setFollowing(data.following);
  }

  async function toggleSave() {
    const res = await fetch('/api/saved/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemType: 'PRO', itemId: Number(id) }),
    });
    const data = await res.json();
    setSaved(data.saved);
  }

  async function likePost(postId: number) {
    const res = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                likeCount: data.likeCount,
                likedByCurrentUser: data.liked,
              }
            : p
        )
      );
    } else if (res.status === 401) {
      alert('Please sign in to like posts');
    }
  }

  async function toggleSavePost(postId: number) {
    const res = await fetch('/api/saved/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemType: 'POST', itemId: postId }),
    });
    if (res.ok) {
      const data = await res.json();
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, savedByCurrentUser: data.saved } : p
        )
      );
    }
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professionalId: Number(id),
          rating: reviewRating,
          text: reviewText || undefined,
          actualDurationMinutes: reviewDuration
            ? parseInt(reviewDuration, 10)
            : undefined,
        }),
      });
      if (res.ok) {
        const newReview = await res.json();
        setReviews((prev) => [newReview, ...prev]);
        setShowReviewForm(false);
        setReviewRating(5);
        setReviewText('');
        setReviewDuration('');
      } else if (res.status === 401) {
        alert('Please sign in to leave a review');
      } else {
        alert('Failed to submit review');
      }
    } finally {
      setSubmittingReview(false);
    }
  }

  if (!profile) return <main style={{ padding: 24 }}>Loading...</main>;

  const pro = profile.professional;

  return (
    <main className="space-y-6">
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-semibold">{profile.name}</h1>
        <div className="text-sm text-gray-600">
          Role: {profile.role} • {profile.location}
        </div>
        {pro && (
          <div className="mt-4">
            <div className="text-gray-700">{pro.bio}</div>
            <div className="mt-2 text-sm text-gray-600">
              Specialties:{' '}
              {(() => {
                try {
                  return pro.specialties
                    ? JSON.parse(pro.specialties).join(', ')
                    : '';
                } catch {
                  return '';
                }
              })()}
            </div>
            <div className="text-sm text-gray-600">
              Hair types:{' '}
              {(() => {
                try {
                  return pro.hairTypesServed
                    ? JSON.parse(pro.hairTypesServed).join(', ')
                    : '';
                } catch {
                  return '';
                }
              })()}
            </div>
            <div className="mt-2">Avg rating: {pro.averageRating || '—'}</div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={toggleFollow}
                className="px-3 py-1 border rounded"
              >
                {following ? 'Unfollow' : 'Follow'}
              </button>
              <button onClick={toggleSave} className="px-3 py-1 border rounded">
                {saved ? 'Unsave' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">Portfolio</h2>
        <div className="grid gap-4">
          {posts.map((p) => (
            <article
              key={p.id}
              className="bg-white border rounded p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{p.caption}</div>
                  <div className="text-sm text-gray-600">
                    Tags: {(p.styleTags || []).join(', ')}
                  </div>
                  <div className="text-sm text-gray-600">
                    Est:{' '}
                    {p.estimatedDurationMinutes
                      ? `${p.estimatedDurationMinutes} min`
                      : '—'}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => likePost(p.id)} className="px-2 py-1">
                    {p.likedByCurrentUser
                      ? `♥ ${p.likeCount || 0}`
                      : `♡ ${p.likeCount || 0}`}
                  </button>
                  <button
                    onClick={() => toggleSavePost(p.id)}
                    className="px-2 py-1 border rounded"
                  >
                    {p.savedByCurrentUser ? 'Unsave' : 'Save'}
                  </button>
                  <a href={`/posts/${p.id}`} className="text-indigo-600">
                    Open
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {pro && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">
              Reviews ({reviews.length})
            </h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
            >
              {showReviewForm ? 'Cancel' : 'Write Review'}
            </button>
          </div>

          {showReviewForm && (
            <form
              onSubmit={submitReview}
              className="bg-white border rounded p-4 mb-4 space-y-3"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="border rounded px-2 py-1"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} star{n !== 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Your Review
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="border rounded px-2 py-1 w-full"
                  rows={3}
                  placeholder="Share your experience..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Actual Duration (minutes, optional)
                </label>
                <input
                  type="number"
                  value={reviewDuration}
                  onChange={(e) => setReviewDuration(e.target.value)}
                  className="border rounded px-2 py-1 w-24"
                  placeholder="e.g. 45"
                  min="1"
                />
              </div>
              <button
                type="submit"
                disabled={submittingReview}
                className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}

          <div className="space-y-3">
            {reviews.length === 0 ? (
              <p className="text-gray-500">No reviews yet.</p>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white border rounded p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {'★'.repeat(review.rating)}
                      {'☆'.repeat(5 - review.rating)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {review.text && (
                    <p className="mt-2 text-gray-700">{review.text}</p>
                  )}
                  {review.actualDurationMinutes && (
                    <p className="mt-1 text-sm text-gray-500">
                      Duration: {review.actualDurationMinutes} min
                    </p>
                  )}
                  {review.clientName && (
                    <p className="mt-1 text-sm text-gray-500">
                      — {review.clientName}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </main>
  );
}
