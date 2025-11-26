import { useEffect, useState } from 'react'

type ProCard = {
  id: number
  name: string
  location?: string
  specialties?: string[]
  averageRating?: number
}

export default function Explore() {
  const [pros, setPros] = useState<ProCard[]>([])
  const [city, setCity] = useState('')
  const [styles, setStyles] = useState('')
  const [hairTypes, setHairTypes] = useState('')
  const [minRating, setMinRating] = useState('')

  async function search(page = 1) {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (styles) params.set('styleTags', styles)
    if (hairTypes) params.set('hairTypes', hairTypes)
    if (minRating) params.set('minRating', minRating)
    params.set('page', String(page))
    const res = await fetch('/api/search?' + params.toString())
    if (res.ok) {
      const data = await res.json()
      setPros(data.results)
    }
  }

  useEffect(() => { search(1) }, [])

  return (
    <main>
      <h2 className="text-2xl font-semibold mb-4">Explore Professionals</h2>
      <section className="mb-6 flex gap-2 items-center">
        <input placeholder="City" value={city} onChange={e=>setCity(e.target.value)} className="border px-2 py-1 rounded" />
        <input placeholder="Styles (comma)" value={styles} onChange={e=>setStyles(e.target.value)} className="border px-2 py-1 rounded" />
        <input placeholder="Hair types (comma)" value={hairTypes} onChange={e=>setHairTypes(e.target.value)} className="border px-2 py-1 rounded" />
        <input placeholder="Min rating" value={minRating} onChange={e=>setMinRating(e.target.value)} className="border px-2 py-1 rounded w-24" />
        <button onClick={()=>search(1)} className="ml-2 px-3 py-1 bg-indigo-600 text-white rounded">Search</button>
      </section>

      <div className="grid gap-4">
        {pros.map(p => (
          <div key={p.id} className="bg-white border rounded p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">{p.name}</h3>
                <div className="text-sm text-gray-600">{p.location}</div>
              </div>
              <div className="text-sm text-gray-700">Rating: {p.averageRating ?? '—'}</div>
            </div>
            <div className="mt-2 text-sm text-gray-700">{(p.specialties || []).join(', ')}</div>
            <div className="mt-3">
              <a href={`/profiles/${p.id}`} className="text-indigo-600">View profile</a>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
