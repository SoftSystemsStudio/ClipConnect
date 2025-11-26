import Link from 'next/link'
import Button from './ui/Button'

export default function Header(){
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/"><a className="text-xl font-semibold">ClipConnect</a></Link>
        <nav className="flex items-center gap-4">
          <Link href="/explore"><a className="text-sm text-gray-600 hover:text-gray-900">Explore</a></Link>
          <Link href="/create-post"><a className="text-sm text-gray-600 hover:text-gray-900">Create</a></Link>
          <Link href="/saved"><a className="text-sm text-gray-600 hover:text-gray-900">Saved</a></Link>
          <Link href="/signin"><a><Button variant="primary">Sign in</Button></a></Link>
        </nav>
      </div>
    </header>
  )
}
