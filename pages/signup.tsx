import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('CLIENT')
  const router = useRouter()

  async function submit(e:any) {
    e.preventDefault()
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, name, role }) })
    if (res.ok) router.push('/signin')
    else alert('Error')
  }

  return (
    <main style={{ padding: 24 }}>
      <h2>Sign up</h2>
      <form onSubmit={submit}>
        <div>
          <label>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <div>
          <label>Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div>
          <label>Role</label>
          <select value={role} onChange={e=>setRole(e.target.value)}>
            <option value="CLIENT">Client</option>
            <option value="PRO">Professional</option>
          </select>
        </div>
        <button type="submit">Create account</button>
      </form>
    </main>
  )
}
