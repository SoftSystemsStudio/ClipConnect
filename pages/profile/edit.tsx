import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Common fields
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState('');

  // Professional fields
  const [bio, setBio] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [hairTypesServed, setHairTypesServed] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [bookingUrl, setBookingUrl] = useState('');
  const [experienceYears, setExperienceYears] = useState('');

  // Client fields
  const [hairTypes, setHairTypes] = useState('');
  const [usualStyles, setUsualStyles] = useState('');
  const [preferredPriceRange, setPreferredPriceRange] = useState('');
  const [defaultCity, setDefaultCity] = useState('');

  useEffect(() => {
    fetch('/api/profile/me', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) {
          router.push('/signin');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;

        setName(data.name || '');
        setLocation(data.location || '');
        setRole(data.role);

        if (data.role === 'PRO' && data.professional) {
          const pro = data.professional;
          setBio(pro.bio || '');
          setSpecialties(safeParseArray(pro.specialties).join(', '));
          setHairTypesServed(safeParseArray(pro.hairTypesServed).join(', '));
          setPriceRange(pro.priceRange || '');
          setShopName(pro.shopName || '');
          setShopAddress(pro.shopAddress || '');
          setBookingUrl(pro.bookingUrl || '');
          setExperienceYears(pro.experienceYears?.toString() || '');
        } else if (data.role === 'CLIENT' && data.client) {
          const client = data.client;
          setHairTypes(safeParseArray(client.hairTypes).join(', '));
          setUsualStyles(safeParseArray(client.usualStyles).join(', '));
          setPreferredPriceRange(client.preferredPriceRange || '');
          setDefaultCity(client.defaultCity || '');
        }

        setLoading(false);
      })
      .catch(() => {
        router.push('/signin');
      });
  }, [router]);

  function safeParseArray(val: string | null | undefined): string[] {
    if (!val) return [];
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  }

  function stringToArray(val: string): string[] {
    return val
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const body: any = {
        name,
        location,
      };

      if (role === 'PRO') {
        body.bio = bio;
        body.specialties = stringToArray(specialties);
        body.hairTypesServed = stringToArray(hairTypesServed);
        body.priceRange = priceRange;
        body.shopName = shopName;
        body.shopAddress = shopAddress;
        body.bookingUrl = bookingUrl;
        body.experienceYears = experienceYears
          ? parseInt(experienceYears, 10)
          : null;
      } else {
        body.hairTypes = stringToArray(hairTypes);
        body.usualStyles = stringToArray(usualStyles);
        body.preferredPriceRange = preferredPriceRange;
        body.defaultCity = defaultCity;
      }

      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSuccess('Profile updated successfully!');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to update profile');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="p-6">Loading...</main>;
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Edit Profile</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Common fields */}
        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-medium mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="City, State"
              />
            </div>
          </div>
        </section>

        {/* Professional-specific fields */}
        {role === 'PRO' && (
          <section className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-medium mb-4">Professional Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  placeholder="Tell clients about yourself..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Specialties (comma-separated)
                </label>
                <input
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Fades, Braids, Color"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Hair Types Served (comma-separated)
                </label>
                <input
                  value={hairTypesServed}
                  onChange={(e) => setHairTypesServed(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Straight, Curly, Coily"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Price Range
                  </label>
                  <input
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="$30-$60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Shop Name
                </label>
                <input
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Shop Address
                </label>
                <input
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Booking URL
                </label>
                <input
                  type="url"
                  value={bookingUrl}
                  onChange={(e) => setBookingUrl(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="https://..."
                />
              </div>
            </div>
          </section>
        )}

        {/* Client-specific fields */}
        {role === 'CLIENT' && (
          <section className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-medium mb-4">Your Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Your Hair Types (comma-separated)
                </label>
                <input
                  value={hairTypes}
                  onChange={(e) => setHairTypes(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Curly, Thick"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Usual Styles (comma-separated)
                </label>
                <input
                  value={usualStyles}
                  onChange={(e) => setUsualStyles(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Fade, Undercut"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Preferred Price Range
                </label>
                <input
                  value={preferredPriceRange}
                  onChange={(e) => setPreferredPriceRange(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="$20-$40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Default City
                </label>
                <input
                  value={defaultCity}
                  onChange={(e) => setDefaultCity(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Your city"
                />
              </div>
            </div>
          </section>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}
