import { useState } from 'react';
import { useRouter } from 'next/router';
import { useToast } from '../components/Toast';

export default function CreatePost() {
  const router = useRouter();
  const { showToast } = useToast();
  const [mediaUrls, setMediaUrls] = useState('');
  const [caption, setCaption] = useState('');
  const [styleTags, setStyleTags] = useState('');
  const [hairTypeTags, setHairTypeTags] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');

  async function submit(e: any) {
    e.preventDefault();
    const body = {
      mediaUrls: mediaUrls
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      caption,
      styleTags: styleTags
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      hairTypeTags: hairTypeTags
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      estimatedDurationMinutes: estimatedDuration
        ? Number(estimatedDuration)
        : null,
    };
    const res = await fetch('/api/posts/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    if (res.ok) {
      showToast('Post created successfully', 'success');
      router.push('/explore');
    } else {
      const data = await res.json().catch(() => ({}));
      showToast(data.error || 'Error creating post', 'error');
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h2>Create Post</h2>
      <form onSubmit={submit}>
        <div>
          <label>Media URLs (comma separated)</label>
          <input
            value={mediaUrls}
            onChange={(e) => setMediaUrls(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label>Caption</label>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label>Style tags (comma separated)</label>
          <input
            value={styleTags}
            onChange={(e) => setStyleTags(e.target.value)}
          />
        </div>
        <div>
          <label>Hair type tags (comma separated)</label>
          <input
            value={hairTypeTags}
            onChange={(e) => setHairTypeTags(e.target.value)}
          />
        </div>
        <div>
          <label>Estimated duration (minutes)</label>
          <input
            value={estimatedDuration}
            onChange={(e) => setEstimatedDuration(e.target.value)}
          />
        </div>
        <button type="submit">Create</button>
      </form>
    </main>
  );
}
