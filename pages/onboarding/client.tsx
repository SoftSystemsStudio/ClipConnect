import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../components/Header';
import { useToast } from '../../components/Toast';

const HAIR_TYPES = [
  { value: '1', label: 'Type 1 - Straight' },
  { value: '2a', label: 'Type 2A - Wavy' },
  { value: '2b', label: 'Type 2B - Wavy' },
  { value: '2c', label: 'Type 2C - Wavy' },
  { value: '3a', label: 'Type 3A - Curly' },
  { value: '3b', label: 'Type 3B - Curly' },
  { value: '3c', label: 'Type 3C - Curly' },
  { value: '4a', label: 'Type 4A - Coily' },
  { value: '4b', label: 'Type 4B - Coily' },
  { value: '4c', label: 'Type 4C - Coily' },
];

const STYLE_PREFERENCES = [
  'Fades', 'Braids', 'Locs', 'Twists', 'Natural', 'Relaxed',
  'Color', 'Extensions', 'Protective Styles', 'Short Cuts',
  'Long Styles', 'Updos',
];

export default function OnboardingClient() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedHairTypes, setSelectedHairTypes] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [defaultCity, setDefaultCity] = useState('');
  const [preferredPriceRange, setPreferredPriceRange] = useState('');

  const toggleHairType = (type: string) => {
    setSelectedHairTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style)
        ? prev.filter((s) => s !== style)
        : [...prev, style]
    );
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const body = {
      hairTypes: selectedHairTypes,
      usualStyles: selectedStyles,
      defaultCity,
      preferredPriceRange,
    };

    try {
      const res = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showToast('Profile saved successfully', 'success');
        router.push('/explore');
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || 'Failed to save profile', 'error');
      }
    } catch {
      showToast('An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Complete Your Profile | ClipConnect</title>
      </Head>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Welcome to ClipConnect!</h1>
              <p className="mt-2 text-gray-600">
                Tell us about your hair so we can help you find the perfect stylist.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-6">
              {/* Hair Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What&apos;s your hair type?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {HAIR_TYPES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleHairType(value)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${
                        selectedHairTypes.includes(value)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Select all that apply. Not sure? That&apos;s okay - you can update this later.
                </p>
              </div>

              {/* Style Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What styles are you interested in?
                </label>
                <div className="flex flex-wrap gap-2">
                  {STYLE_PREFERENCES.map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => toggleStyle(style)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedStyles.includes(style)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="defaultCity" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Location
                </label>
                <input
                  id="defaultCity"
                  type="text"
                  value={defaultCity}
                  onChange={(e) => setDefaultCity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Atlanta, GA"
                />
                <p className="mt-1 text-sm text-gray-500">
                  We&apos;ll use this to show you nearby stylists.
                </p>
              </div>

              {/* Price Range */}
              <div>
                <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Price Range
                </label>
                <select
                  id="priceRange"
                  value={preferredPriceRange}
                  onChange={(e) => setPreferredPriceRange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select a range</option>
                  <option value="$">Budget-friendly ($)</option>
                  <option value="$$">Mid-range ($$)</option>
                  <option value="$$$">Premium ($$$)</option>
                  <option value="$$$$">Luxury ($$$$)</option>
                  <option value="any">No preference</option>
                </select>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Saving...' : 'Find Stylists'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/explore')}
                  className="w-full mt-3 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
