import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../components/Header';
import { useToast } from '../../components/Toast';

const SPECIALTIES = [
  'Fades', 'Braids', 'Locs', 'Natural Hair', 'Color', 'Cuts',
  'Extensions', 'Perms', 'Relaxers', 'Weaves', 'Silk Press',
];

const HAIR_TYPES = [
  '1 (Straight)', '2 (Wavy)', '3 (Curly)', '4 (Coily)',
  'All Types',
];

export default function OnboardingPro() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedHairTypes, setSelectedHairTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [bookingUrl, setBookingUrl] = useState('');
  const [minCut, setMinCut] = useState('');
  const [maxCut, setMaxCut] = useState('');
  const [experienceYears, setExperienceYears] = useState('');

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    );
  };

  const toggleHairType = (type: string) => {
    setSelectedHairTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const body = {
      bio,
      specialties: selectedSpecialties,
      hairTypesServed: selectedHairTypes,
      priceRange,
      shopName,
      shopAddress,
      bookingUrl,
      experienceYears: experienceYears ? Number(experienceYears) : undefined,
      minCutDurationMinutes: minCut ? Number(minCut) : undefined,
      maxCutDurationMinutes: maxCut ? Number(maxCut) : undefined,
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
              <h1 className="text-2xl font-bold text-gray-900">Complete Your Professional Profile</h1>
              <p className="mt-2 text-gray-600">
                Help clients find you by filling out your profile details.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-6">
              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  About You
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Tell clients about yourself, your experience, and what makes you unique..."
                />
              </div>

              {/* Specialties */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialties
                </label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map((specialty) => (
                    <button
                      key={specialty}
                      type="button"
                      onClick={() => toggleSpecialty(specialty)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedSpecialties.includes(specialty)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hair Types You Serve
                </label>
                <div className="flex flex-wrap gap-2">
                  {HAIR_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleHairType(type)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedHairTypes.includes(type)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shop Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-1">
                    Shop/Business Name
                  </label>
                  <input
                    id="shopName"
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Your salon or studio name"
                  />
                </div>
                <div>
                  <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience
                  </label>
                  <input
                    id="experienceYears"
                    type="number"
                    min="0"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., 5"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="shopAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Location/Address
                </label>
                <input
                  id="shopAddress"
                  type="text"
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="City, State or full address"
                />
              </div>

              {/* Pricing & Duration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1">
                    Price Range
                  </label>
                  <input
                    id="priceRange"
                    type="text"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., $30-$80"
                  />
                </div>
                <div>
                  <label htmlFor="minCut" className="block text-sm font-medium text-gray-700 mb-1">
                    Min Duration (mins)
                  </label>
                  <input
                    id="minCut"
                    type="number"
                    min="0"
                    value={minCut}
                    onChange={(e) => setMinCut(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label htmlFor="maxCut" className="block text-sm font-medium text-gray-700 mb-1">
                    Max Duration (mins)
                  </label>
                  <input
                    id="maxCut"
                    type="number"
                    min="0"
                    value={maxCut}
                    onChange={(e) => setMaxCut(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="90"
                  />
                </div>
              </div>

              {/* Booking URL */}
              <div>
                <label htmlFor="bookingUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  External Booking URL (optional)
                </label>
                <input
                  id="bookingUrl"
                  type="url"
                  value={bookingUrl}
                  onChange={(e) => setBookingUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="https://your-booking-site.com"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Link to your booking page on Square, Booksy, etc.
                </p>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Saving...' : 'Complete Profile'}
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
