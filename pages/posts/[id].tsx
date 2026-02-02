import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ui/ConfirmDialog';

type User = {
  id: number;
  role: string;
};

export default function PostDetail() {
  const router = useRouter();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const { id } = router.query;
  const [post, setPost] = useState<any>(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Fetch current user
    fetch('/api/profile/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null));
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/posts/${id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data: any) => {
        setPost(data);
        setLiked(!!data.likedByCurrentUser);
        setEditCaption(data.caption || '');
        setEditLocation(data.location || '');
      });
  }, [id]);

  async function like() {
    const res = await fetch(`/api/posts/${id}/like`, {
      method: 'POST',
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      setLiked(!!data.liked);
      setPost((p: any) => ({ ...p, likeCount: data.likeCount }));
    } else if (res.status === 401) {
      showToast('Please sign in to like posts', 'error');
    }
  }

  async function toggleSave() {
    const res = await fetch('/api/saved/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ itemType: 'POST', itemId: Number(id) }),
    });
    if (res.ok) {
      const data = await res.json();
      setSaved(data.saved);
    }
  }

  async function handleDelete() {
    const confirmed = await confirm({
      title: 'Delete Post',
      message: 'Are you sure you want to delete this post? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (!confirmed) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        showToast('Post deleted successfully', 'success');
        router.push('/');
      } else {
        showToast('Failed to delete post', 'error');
      }
    } finally {
      setDeleting(false);
    }
  }

  async function handleSaveEdit() {
    const res = await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        caption: editCaption,
        location: editLocation,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPost(updated);
      setIsEditing(false);
      showToast('Post updated successfully', 'success');
    } else {
      showToast('Failed to update post', 'error');
    }
  }

  if (!post) return <main className="p-6">Loading...</main>;

  const isOwner = currentUser && post.professionalId === currentUser.id;

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Caption</label>
              <input
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold">
                  {post.caption || 'Post'}
                </h1>
                <a
                  href={`/profiles/${post.professionalId}`}
                  className="text-indigo-600 text-sm"
                >
                  View professional profile
                </a>
                {post.location && (
                  <div className="text-sm text-gray-600 mt-1">
                    Location: {post.location}
                  </div>
                )}
              </div>

              {isOwner && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              )}
            </div>

            {(post.mediaUrls || []).length > 0 && (
              <div className="flex gap-2 mt-4 overflow-x-auto">
                {post.mediaUrls.map((u: string, i: number) => (
                  <img
                    key={i}
                    src={u}
                    alt={`media-${i}`}
                    className="w-48 h-48 object-cover rounded"
                  />
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={like}
                className={`px-4 py-2 rounded ${
                  liked
                    ? 'bg-pink-100 text-pink-700'
                    : 'border hover:bg-gray-50'
                }`}
              >
                {liked ? '♥ Liked' : `♡ Like`} ({post.likeCount || 0})
              </button>
              <button
                onClick={toggleSave}
                className={`px-4 py-2 rounded ${
                  saved
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'border hover:bg-gray-50'
                }`}
              >
                {saved ? '★ Saved' : '☆ Save'}
              </button>
            </div>

            {(post.styleTags || []).length > 0 && (
              <div className="mt-4">
                <span className="font-medium">Style Tags:</span>{' '}
                <span className="text-gray-700">
                  {post.styleTags.join(', ')}
                </span>
              </div>
            )}

            {(post.hairTypeTags || []).length > 0 && (
              <div className="mt-2">
                <span className="font-medium">Hair Types:</span>{' '}
                <span className="text-gray-700">
                  {post.hairTypeTags.join(', ')}
                </span>
              </div>
            )}

            {post.estimatedDurationMinutes && (
              <div className="mt-2 text-sm text-gray-600">
                Estimated duration: {post.estimatedDurationMinutes} minutes
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
