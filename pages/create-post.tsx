import { useState } from 'react'
import { useRouter } from 'next/router'

export default function CreatePost() {
  const router = useRouter()
  const [mediaUrls, setMediaUrls] = useState('')
  const [caption, setCaption] = useState('')
  const [styleTags, setStyleTags] = useState('')
  const [hairTypeTags, setHairTypeTags] = useState('')
  const [estimatedDuration, setEstimatedDuration] = useState('')

  async function submit(e:any) {
    e.preventDefault()
    const body = {
      mediaUrls: mediaUrls.split(',').map(s=>s.trim()).filter(Boolean),
      caption,
      styleTags: styleTags.split(',').map(s=>s.trim()).filter(Boolean),
      hairTypeTags: hairTypeTags.split(',').map(s=>s.trim()).filter(Boolean),
      estimatedDurationMinutes: estimatedDuration ? Number(estimatedDuration) : null
    }
    const res = await fetch('/api/posts/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) {
      router.push('/explore')
    } else {
      alert('Error creating post')
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h2>Create Post</h2>
      <form onSubmit={submit}>
        <div>
          <label>Media URLs (comma separated)</label>
          <input value={mediaUrls} onChange={e=>setMediaUrls(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div>
          <label>Caption</label>
          <input value={caption} onChange={e=>setCaption(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div>
          <label>Style tags (comma separated)</label>
          <input value={styleTags} onChange={e=>setStyleTags(e.target.value)} />
        </div>
        <div>
          <label>Hair type tags (comma separated)</label>
          <input value={hairTypeTags} onChange={e=>setHairTypeTags(e.target.value)} />
        </div>
        <div>
          <label>Estimated duration (minutes)</label>
          <input value={estimatedDuration} onChange={e=>setEstimatedDuration(e.target.value)} />
        </div>
        <button type="submit">Create</button>
      </form>
    </main>
  )
}
