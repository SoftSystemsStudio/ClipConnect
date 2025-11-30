import Link from 'next/link'

export default function Header(){
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-semibold">ClipConnect</Link>
        <nav className="flex items-center gap-4">
          <Link href="/explore" className="text-sm text-gray-600 hover:text-gray-900">Explore</Link>
          <Link href="/create-post" className="text-sm text-gray-600 hover:text-gray-900">Create</Link>
          <Link href="/saved" className="text-sm text-gray-600 hover:text-gray-900">Saved</Link>
          <Link href="/signin" className="inline-block"><span className="px-3 py-1 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700">Sign in</span></Link>
        </nav>
      </div>
    </header>
  )
}
