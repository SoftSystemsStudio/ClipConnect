import { useEffect, useState } from 'react';

type ProCard = {
  id: number;
  name: string;
  location?: string;
  specialties?: string[];
  averageRating?: number;
};

export default function Explore() {
  const [pros, setPros] = useState<ProCard[]>([]);
  const [city, setCity] = useState('');
  const [styles, setStyles] = useState('');
  const [hairTypes, setHairTypes] = useState('');
  const [minRating, setMinRating] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  async function search(pageNum = 1, reset = true) {
    setLoading(true);
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (styles) params.set('styleTags', styles);
    if (hairTypes) params.set('hairTypes', hairTypes);
    if (minRating) params.set('minRating', minRating);
    params.set('page', String(pageNum));

    try {
      const res = await fetch('/api/search?' + params.toString());
      if (res.ok) {
        const data = await res.json();
        setPros(data.results);
        setPage(data.page);
        // If we got fewer than 20 results, there's no more
        setHasMore(data.results.length >= 20);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    search(1);
  }, []);

  function handleSearch() {
    setPage(1);
    search(1);
  }

  function handlePrevPage() {
    if (page > 1) {
      search(page - 1);
    }
  }

  function handleNextPage() {
    if (hasMore) {
      search(page + 1);
    }
  }

  return (
    <main>
      <h2 className="text-2xl font-semibold mb-4">Explore Professionals</h2>
      <section className="mb-6 flex flex-wrap gap-2 items-center">
        <input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          placeholder="Styles (comma)"
          value={styles}
          onChange={(e) => setStyles(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          placeholder="Hair types (comma)"
          value={hairTypes}
          onChange={(e) => setHairTypes(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          placeholder="Min rating"
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          className="border px-2 py-1 rounded w-24"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="ml-2 px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </section>

      {loading && pros.length === 0 ? (
        <p className="text-gray-500">Loading...</p>
      ) : pros.length === 0 ? (
        <p className="text-gray-500">No professionals found. Try adjusting your filters.</p>
      ) : (
        <>
          <div className="grid gap-4">
            {pros.map((p) => (
              <div key={p.id} className="bg-white border rounded p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{p.name}</h3>
                    <div className="text-sm text-gray-600">{p.location}</div>
                  </div>
                  <div className="text-sm text-gray-700">
                    Rating: {p.averageRating ? p.averageRating.toFixed(1) : '—'}
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-700">
                  {(p.specialties || []).join(', ')}
                </div>
                <div className="mt-3">
                  <a href={`/profiles/${p.id}`} className="text-indigo-600">
                    View profile
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={handlePrevPage}
              disabled={page <= 1 || loading}
              className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">Page {page}</span>
            <button
              onClick={handleNextPage}
              disabled={!hasMore || loading}
              className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </main>
  );
}
