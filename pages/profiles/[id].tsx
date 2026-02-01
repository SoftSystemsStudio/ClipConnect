import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useToast } from '../../components/Toast';
import { SkeletonProfileCard, SkeletonList } from '../../components/ui/Skeleton';

type Review = {
  id: number;
  rating: number;
  text?: string;
  createdAt: string;
  actualDurationMinutes?: number;
  clientName?: string;
};

type Tool = {
  id: number;
  name: string;
  category: string;
  description?: string;
  affiliateUrl?: string;
};

type FollowCounts = {
  followers: number;
  following: number;
};

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const { showToast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [followCounts, setFollowCounts] = useState<FollowCounts>({ followers: 0, following: 0 });
  const [following, setFollowing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewDuration, setReviewDuration] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    // Fetch all data in parallel
    Promise.all([
      fetch(`/api/profile/${id}`).then((r) => r.json()),
      fetch('/api/posts').then((r) => r.json()),
      fetch(`/api/reviews/pro/${id}`).then((r) => r.json()).catch(() => []),
      fetch(`/api/tools?proId=${id}`, { credentials: 'include' }).then((r) => r.ok ? r.json() : []).catch(() => []),
      fetch(`/api/follow/list?userId=${id}`, { credentials: 'include' }).then((r) => r.ok ? r.json() : { followers: 0, following: 0 }).catch(() => ({ followers: 0, following: 0 })),
    ]).then(([profileData, allPosts, reviewsData, toolsData, countsData]) => {
      setProfile(profileData);
      setPosts(allPosts.filter((p: any) => p.professionalId === Number(id)));
      setReviews(reviewsData);
      setTools(toolsData);
      setFollowCounts(countsData);
      setLoading(false);
    });
  }, [id]);

  async function toggleFollow() {
    const res = await fetch('/api/follow/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ professionalId: Number(id) }),
    });
    if (res.ok) {
      const data = await res.json();
      setFollowing(data.following);
      setFollowCounts((prev) => ({
        ...prev,
        followers: prev.followers + (data.following ? 1 : -1),
      }));
      showToast(data.following ? 'Following!' : 'Unfollowed', 'success');
    } else if (res.status === 401) {
      showToast('Please sign in to follow', 'error');
    }
  }

  async function toggleSave() {
    const res = await fetch('/api/saved/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ itemType: 'PRO', itemId: Number(id) }),
    });
    if (res.ok) {
      const data = await res.json();
      setSaved(data.saved);
      showToast(data.saved ? 'Saved!' : 'Removed from saved', 'success');
    }
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
            ? { ...p, likeCount: data.likeCount, likedByCurrentUser: data.liked }
            : p
        )
      );
    } else if (res.status === 401) {
      showToast('Please sign in to like posts', 'error');
    }
  }

  async function toggleSavePost(postId: number) {
    const res = await fetch('/api/saved/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
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

  async function handleToolClick(tool: Tool) {
    // Track click
    fetch(`/api/tools/${tool.id}/click`).catch(() => {});
    // Open affiliate URL
    if (tool.affiliateUrl) {
      window.open(tool.affiliateUrl, '_blank');
    }
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          professionalId: Number(id),
          rating: reviewRating,
          text: reviewText || undefined,
          actualDurationMinutes: reviewDuration ? parseInt(reviewDuration, 10) : undefined,
        }),
      });
      if (res.ok) {
        const newReview = await res.json();
        setReviews((prev) => [newReview, ...prev]);
        setShowReviewForm(false);
        setReviewRating(5);
        setReviewText('');
        setReviewDuration('');
        showToast('Review submitted!', 'success');
      } else if (res.status === 401) {
        showToast('Please sign in to leave a review', 'error');
      } else {
        showToast('Failed to submit review', 'error');
      }
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) {
    return (
      <main className="space-y-6">
        <SkeletonProfileCard />
        <SkeletonList count={2} type="post" />
      </main>
    );
  }

  if (!profile) {
    return <main className="p-6">Profile not found</main>;
  }

  const pro = profile.professional;

  return (
    <main className="space-y-6">
      <div className="bg-white p-6 rounded shadow">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{profile.name}</h1>
            <div className="text-sm text-gray-600">
              {profile.role === 'PRO' ? 'Professional' : 'Client'} • {profile.location || 'Location not set'}
            </div>
            {pro && (
              <div className="flex gap-4 mt-2 text-sm">
                <span><strong>{followCounts.followers}</strong> followers</span>
                <span><strong>{followCounts.following}</strong> following</span>
              </div>
            )}
          </div>
          {pro && (
            <div className="flex gap-2">
              <button
                onClick={toggleFollow}
                className={`px-4 py-2 rounded ${
                  following
                    ? 'border border-gray-300 hover:bg-gray-50'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {following ? 'Following' : 'Follow'}
              </button>
              <button
                onClick={toggleSave}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                {saved ? '★ Saved' : '☆ Save'}
              </button>
            </div>
          )}
        </div>

        {pro && (
          <div className="mt-4">
            {pro.bio && <p className="text-gray-700 mb-3">{pro.bio}</p>}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Specialties:</span>{' '}
                {(() => {
                  try {
                    return pro.specialties ? JSON.parse(pro.specialties).join(', ') : '—';
                  } catch { return '—'; }
                })()}
              </div>
              <div>
                <span className="font-medium">Hair types:</span>{' '}
                {(() => {
                  try {
                    return pro.hairTypesServed ? JSON.parse(pro.hairTypesServed).join(', ') : '—';
                  } catch { return '—'; }
                })()}
              </div>
              <div>
                <span className="font-medium">Rating:</span>{' '}
                {pro.averageRating ? `${pro.averageRating.toFixed(1)} ★` : '—'} ({pro.reviewsCount || 0} reviews)
              </div>
              <div>
                <span className="font-medium">Price range:</span> {pro.priceRange || '—'}
              </div>
              {pro.shopName && (
                <div>
                  <span className="font-medium">Shop:</span> {pro.shopName}
                </div>
              )}
              {pro.bookingUrl && (
                <div>
                  <a href={pro.bookingUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                    Book appointment →
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tools Section */}
      {pro && tools.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Recommended Tools & Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => handleToolClick(tool)}
                className="bg-white border rounded p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{tool.name}</div>
                    <div className="text-sm text-gray-500">{tool.category}</div>
                  </div>
                  {tool.affiliateUrl && (
                    <span className="text-indigo-600">→</span>
                  )}
                </div>
                {tool.description && (
                  <p className="text-sm text-gray-600 mt-2">{tool.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Portfolio Section */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Portfolio</h2>
        {posts.length === 0 ? (
          <p className="text-gray-500">No posts yet.</p>
        ) : (
          <div className="grid gap-4">
            {posts.map((p) => (
              <article key={p.id} className="bg-white border rounded p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{p.caption}</div>
                    <div className="text-sm text-gray-600">
                      Tags: {(p.styleTags || []).join(', ') || '—'}
                    </div>
                    <div className="text-sm text-gray-600">
                      Est: {p.estimatedDurationMinutes ? `${p.estimatedDurationMinutes} min` : '—'}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button onClick={() => likePost(p.id)} className="px-2 py-1">
                      {p.likedByCurrentUser ? `♥ ${p.likeCount || 0}` : `♡ ${p.likeCount || 0}`}
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
        )}
      </section>

      {/* Reviews Section */}
      {pro && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Reviews ({reviews.length})</h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
            >
              {showReviewForm ? 'Cancel' : 'Write Review'}
            </button>
          </div>

          {showReviewForm && (
            <form onSubmit={submitReview} className="bg-white border rounded p-4 mb-4 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="border rounded px-2 py-1"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} star{n !== 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Your Review</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="border rounded px-2 py-1 w-full"
                  rows={3}
                  placeholder="Share your experience..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Actual Duration (minutes, optional)</label>
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
                <div key={review.id} className="bg-white border rounded p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {review.text && <p className="mt-2 text-gray-700">{review.text}</p>}
                  {review.actualDurationMinutes && (
                    <p className="mt-1 text-sm text-gray-500">Duration: {review.actualDurationMinutes} min</p>
                  )}
                  {review.clientName && (
                    <p className="mt-1 text-sm text-gray-500">— {review.clientName}</p>
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
