import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function ProfilePage() {
  const router = useRouter()
  const { id } = router.query
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [following, setFollowing] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/profile/${id}`).then(r=>r.json()).then(setProfile)
    fetch('/api/posts').then(r=>r.json()).then((all:any[])=>{
      const filtered = all.filter(p=>p.professionalId === Number(id))
      setPosts(filtered)
    })
  }, [id])

  async function toggleFollow() {
    const res = await fetch('/api/follow/toggle', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ professionalId: Number(id) }) })
    const data = await res.json()
    setFollowing(data.following)
  }

  async function toggleSave() {
    const res = await fetch('/api/saved/toggle', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ itemType: 'PRO', itemId: Number(id) }) })
    const data = await res.json()
    setSaved(data.saved)
  }

  async function likePost(postId:number) {
    const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST', credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likeCount: data.likeCount, likedByCurrentUser: data.liked } : p))
    } else if (res.status === 401) {
      alert('Please sign in to like posts')
    }
  }

  async function toggleSavePost(postId:number) {
    const res = await fetch('/api/saved/toggle', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ itemType: 'POST', itemId: postId }) })
    if (res.ok) {
      const data = await res.json()
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, savedByCurrentUser: data.saved } : p))
    }
  }

  if (!profile) return <main style={{ padding: 24 }}>Loading...</main>

  const pro = profile.professional

  return (
    <main className="space-y-6">
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-semibold">{profile.name}</h1>
        <div className="text-sm text-gray-600">Role: {profile.role} • {profile.location}</div>
        {pro && (
          <div className="mt-4">
            <div className="text-gray-700">{pro.bio}</div>
            <div className="mt-2 text-sm text-gray-600">Specialties: {(pro.specialties && JSON.parse(pro.specialties))?.join(', ')}</div>
            <div className="text-sm text-gray-600">Hair types: {(pro.hairTypesServed && JSON.parse(pro.hairTypesServed))?.join(', ')}</div>
            <div className="mt-2">Avg rating: {pro.averageRating || '—'}</div>
            <div className="mt-3 flex gap-2">
              <button onClick={toggleFollow} className="px-3 py-1 border rounded">{following ? 'Unfollow' : 'Follow'}</button>
              <button onClick={toggleSave} className="px-3 py-1 border rounded">{saved ? 'Unsave' : 'Save'}</button>
            </div>
          </div>
        )}
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">Portfolio</h2>
        <div className="grid gap-4">
          {posts.map(p => (
            <article key={p.id} className="bg-white border rounded p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{p.caption}</div>
                  <div className="text-sm text-gray-600">Tags: {(p.styleTags || []).join(', ')}</div>
                  <div className="text-sm text-gray-600">Est: {p.estimatedDurationMinutes ? `${p.estimatedDurationMinutes} min` : '—'}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={()=>likePost(p.id)} className="px-2 py-1">{p.likedByCurrentUser ? `♥ ${p.likeCount || 0}` : `♡ ${p.likeCount || 0}`}</button>
                  <button onClick={()=>toggleSavePost(p.id)} className="px-2 py-1 border rounded">{p.savedByCurrentUser ? 'Unsave' : 'Save'}</button>
                  <a href={`/posts/${p.id}`} className="text-indigo-600">Open</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
