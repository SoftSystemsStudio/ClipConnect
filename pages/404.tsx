import Link from 'next/link';
import Head from 'next/head';

export default function NotFoundPage() {
  return (
    <>
      <Head>
        <title>Page Not Found | ClipConnect</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Head>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-gray-200">404</h1>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">Page not found</h2>
          <p className="mt-2 text-gray-600 max-w-md mx-auto">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
            It might have been moved or doesn&apos;t exist.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Go Home
            </Link>
            <Link
              href="/explore"
              className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Explore Stylists
            </Link>
          </div>
        </div>
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <a href="mailto:support@clipconnect.com" className="text-indigo-600 hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
