import { useEffect, useState } from 'react';
import Link from 'next/link';

type SavedPost = {
  id: number;
  caption?: string;
  styleTags: string[];
  professionalId: number;
  professionalName?: string;
};

type SavedPro = {
  id: number;
  name: string;
  location?: string;
  specialties?: string[];
  averageRating?: number;
};

export default function SavedPage() {
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [savedPros, setSavedPros] = useState<SavedPro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSaved() {
      try {
        const res = await fetch('/api/saved');
        if (res.status === 401) {
          setError('Please sign in to view saved items');
          setLoading(false);
          return;
        }
        if (!res.ok) {
          setError('Failed to load saved items');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setSavedPosts(data.posts || []);
        setSavedPros(data.professionals || []);
      } catch {
        setError('Failed to load saved items');
      } finally {
        setLoading(false);
      }
    }
    fetchSaved();
  }, []);

  async function unsavePost(postId: number) {
    const res = await fetch('/api/saved/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemType: 'POST', itemId: postId }),
    });
    if (res.ok) {
      setSavedPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  }

  async function unsavePro(proId: number) {
    const res = await fetch('/api/saved/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemType: 'PRO', itemId: proId }),
    });
    if (res.ok) {
      setSavedPros((prev) => prev.filter((p) => p.id !== proId));
    }
  }

  if (loading) return <main className="p-6">Loading...</main>;
  if (error)
    return (
      <main className="p-6">
        <p className="text-red-600">{error}</p>
        <Link href="/signin" className="text-indigo-600 mt-2 inline-block">
          Sign in
        </Link>
      </main>
    );

  return (
    <main className="space-y-8">
      <h1 className="text-2xl font-semibold">Saved Items</h1>

      <section>
        <h2 className="text-xl font-medium mb-4">Saved Professionals</h2>
        {savedPros.length === 0 ? (
          <p className="text-gray-500">No saved professionals yet.</p>
        ) : (
          <div className="grid gap-4">
            {savedPros.map((pro) => (
              <div
                key={pro.id}
                className="bg-white border rounded p-4 shadow-sm flex items-center justify-between"
              >
                <div>
                  <h3 className="font-medium">{pro.name}</h3>
                  <div className="text-sm text-gray-600">{pro.location}</div>
                  <div className="text-sm text-gray-600">
                    {(pro.specialties || []).join(', ')}
                  </div>
                  {pro.averageRating && (
                    <div className="text-sm text-gray-700">
                      Rating: {pro.averageRating}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/profiles/${pro.id}`}
                    className="text-indigo-600"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => unsavePro(pro.id)}
                    className="text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-medium mb-4">Saved Posts</h2>
        {savedPosts.length === 0 ? (
          <p className="text-gray-500">No saved posts yet.</p>
        ) : (
          <div className="grid gap-4">
            {savedPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white border rounded p-4 shadow-sm flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">
                    {post.caption || 'Untitled'}
                  </div>
                  <div className="text-sm text-gray-600">
                    Tags: {(post.styleTags || []).join(', ')}
                  </div>
                  {post.professionalName && (
                    <div className="text-sm text-gray-500">
                      By {post.professionalName}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href={`/posts/${post.id}`} className="text-indigo-600">
                    View
                  </Link>
                  <button
                    onClick={() => unsavePost(post.id)}
                    className="text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
