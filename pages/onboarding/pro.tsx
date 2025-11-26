import { useState } from 'react'
import { useRouter } from 'next/router'

export default function OnboardingPro() {
  const router = useRouter()
  const [bio, setBio] = useState('')
  const [specialties, setSpecialties] = useState('')
  const [hairTypesServed, setHairTypesServed] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [shopName, setShopName] = useState('')
  const [bookingUrl, setBookingUrl] = useState('')
  const [minCut, setMinCut] = useState('')
  const [maxCut, setMaxCut] = useState('')

  async function submit(e:any) {
    e.preventDefault()
    const body = {
      bio,
      specialties: specialties.split(',').map(s=>s.trim()).filter(Boolean),
      hairTypesServed: hairTypesServed.split(',').map(s=>s.trim()).filter(Boolean),
      priceRange,
      shopName,
      bookingUrl,
      minCutDurationMinutes: minCut ? Number(minCut) : undefined,
      maxCutDurationMinutes: maxCut ? Number(maxCut) : undefined
    }
    const res = await fetch('/api/profile/update', { method: 'PUT', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(body) })
    if (res.ok) router.push('/explore')
    else alert('Error')
  }

  return (
    <main style={{ padding: 24 }}>
      <h2>Pro Onboarding</h2>
      <form onSubmit={submit}>
        <div>
          <label>Bio</label>
          <textarea value={bio} onChange={e=>setBio(e.target.value)} />
        </div>
        <div>
          <label>Specialties (comma separated)</label>
          <input value={specialties} onChange={e=>setSpecialties(e.target.value)} />
        </div>
        <div>
          <label>Hair types served (comma separated)</label>
          <input value={hairTypesServed} onChange={e=>setHairTypesServed(e.target.value)} />
        </div>
        <div>
          <label>Price range</label>
          <input value={priceRange} onChange={e=>setPriceRange(e.target.value)} />
        </div>
        <div>
          <label>Shop name</label>
          <input value={shopName} onChange={e=>setShopName(e.target.value)} />
        </div>
        <div>
          <label>Booking URL (external)</label>
          <input value={bookingUrl} onChange={e=>setBookingUrl(e.target.value)} />
        </div>
        <div>
          <label>Min cut duration (minutes)</label>
          <input value={minCut} onChange={e=>setMinCut(e.target.value)} />
        </div>
        <div>
          <label>Max cut duration (minutes)</label>
          <input value={maxCut} onChange={e=>setMaxCut(e.target.value)} />
        </div>
        <button type="submit">Save</button>
      </form>
    </main>
  )
}
