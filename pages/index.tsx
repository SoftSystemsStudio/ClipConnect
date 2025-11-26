import Link from 'next/link'
import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>ClipConnect</title>
      </Head>
      <main className="prose lg:prose-xl">
        <h1>ClipConnect — MVP</h1>
        <p className="text-gray-600">Visual-first marketplace for grooming professionals.</p>
        <div className="mt-6 flex gap-3">
          <Link href="/signup"><a className="px-4 py-2 bg-indigo-600 text-white rounded">Sign up</a></Link>
          <Link href="/signin"><a className="px-4 py-2 border rounded">Sign in</a></Link>
          <Link href="/explore"><a className="px-4 py-2 text-indigo-600">Explore</a></Link>
        </div>
      </main>
    </>
  )
}
