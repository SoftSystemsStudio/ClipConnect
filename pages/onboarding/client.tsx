import { useState } from 'react'
import { useRouter } from 'next/router'

export default function OnboardingClient() {
  const router = useRouter()
  const [hairTypes, setHairTypes] = useState('')
  const [usualStyles, setUsualStyles] = useState('')
  const [defaultCity, setDefaultCity] = useState('')

  async function submit(e:any) {
    e.preventDefault()
    const body = {
      hairTypesServed: hairTypes.split(',').map(s=>s.trim()).filter(Boolean),
      defaultCity,
      usualStyles: usualStyles.split(',').map(s=>s.trim()).filter(Boolean)
    }
    const res = await fetch('/api/profile/update', { method: 'PUT', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(body) })
    if (res.ok) router.push('/explore')
    else alert('Error')
  }

  return (
    <main style={{ padding: 24 }}>
      <h2>Client Onboarding</h2>
      <form onSubmit={submit}>
        <div>
          <label>Hair types (comma separated)</label>
          <input value={hairTypes} onChange={e=>setHairTypes(e.target.value)} />
        </div>
        <div>
          <label>Usual styles (comma separated)</label>
          <input value={usualStyles} onChange={e=>setUsualStyles(e.target.value)} />
        </div>
        <div>
          <label>Default city</label>
          <input value={defaultCity} onChange={e=>setDefaultCity(e.target.value)} />
        </div>
        <button type="submit">Save</button>
      </form>
    </main>
  )
}
