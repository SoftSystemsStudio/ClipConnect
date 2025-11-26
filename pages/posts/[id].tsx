import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function PostDetail() {
  const router = useRouter()
  const { id } = router.query
  const [post, setPost] = useState<any>(null)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(()=>{
    if (!id) return
    fetch(`/api/posts/${id}`).then(r=>r.json()).then((data:any)=>{
      setPost(data)
      setLiked(!!data.likedByCurrentUser)
    })
  }, [id])

  async function like() {
    const res = await fetch(`/api/posts/${id}/like`, { method: 'POST', credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      setLiked(!!data.liked)
      setPost((p:any)=> ({ ...p, likeCount: data.likeCount }))
    } else if (res.status === 401) {
      alert('Please sign in to like posts')
    }
  }

  async function toggleSave() {
    const res = await fetch('/api/saved/toggle', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ itemType: 'POST', itemId: Number(id) }) })
    if (res.ok) {
      const data = await res.json()
      setSaved(data.saved)
    }
  }

  if (!post) return <main style={{ padding: 24 }}>Loading...</main>

  return (
    <main style={{ padding: 24 }}>
      <h1>{post.caption || 'Post'}</h1>
      <div>By pro #{post.professionalId}</div>
      <div>Location: {post.location}</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        {(post.mediaUrls || []).map((u:string, i:number)=>(
          <img key={i} src={u} alt={`media-${i}`} style={{ width: 200, height: 200, objectFit: 'cover' }} />
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={like}>{liked ? 'Liked' : `Like (${post.likeCount || 0})`}</button>
        <button onClick={toggleSave} style={{ marginLeft: 8 }}>{saved ? 'Unsave' : 'Save'}</button>
      </div>
      <div style={{ marginTop: 16 }}>
        <strong>Tags:</strong> {(post.styleTags || []).join(', ')}
      </div>
    </main>
  )
}
