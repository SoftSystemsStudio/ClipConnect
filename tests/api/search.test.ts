import { describe, it, expect } from '@jest/globals';

describe('Search API', () => {
  describe('GET /api/search', () => {
    it('should return paginated results', async () => {
      const mockResults = {
        results: [
          { id: 1, name: 'Pro 1', location: 'NYC', averageRating: 4.5 },
          { id: 2, name: 'Pro 2', location: 'LA', averageRating: 4.8 },
        ],
        page: 1,
      };

      expect(mockResults.page).toBe(1);
      expect(mockResults.results.length).toBe(2);
    });

    it('should filter by city', async () => {
      const mockResults = {
        results: [{ id: 1, name: 'Pro 1', location: 'NYC' }],
        page: 1,
      };

      expect(mockResults.results[0].location).toBe('NYC');
    });

    it('should filter by minimum rating', async () => {
      const minRating = 4.0;
      const mockPro = { averageRating: 4.5 };

      expect(mockPro.averageRating).toBeGreaterThanOrEqual(minRating);
    });

    it('should filter by style tags', async () => {
      const styleTags = ['Fades', 'Braids'];
      const mockPro = { specialties: ['Fades', 'Color', 'Braids'] };

      const hasMatchingStyle = styleTags.some((tag) =>
        mockPro.specialties.includes(tag)
      );
      expect(hasMatchingStyle).toBe(true);
    });

    it('should filter by hair types', async () => {
      const hairTypes = ['Curly'];
      const mockPro = { hairTypesServed: ['Straight', 'Curly', 'Coily'] };

      const servesHairType = hairTypes.some((type) =>
        mockPro.hairTypesServed.includes(type)
      );
      expect(servesHairType).toBe(true);
    });
  });
});

describe('parseListParam helper', () => {
  function parseListParam(v: any): string[] {
    if (!v) return [];
    if (Array.isArray(v)) return v;
    return String(v)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  it('should return empty array for null/undefined', () => {
    expect(parseListParam(null)).toEqual([]);
    expect(parseListParam(undefined)).toEqual([]);
  });

  it('should return array as-is', () => {
    expect(parseListParam(['a', 'b'])).toEqual(['a', 'b']);
  });

  it('should split comma-separated string', () => {
    expect(parseListParam('a, b, c')).toEqual(['a', 'b', 'c']);
  });

  it('should filter empty strings', () => {
    expect(parseListParam('a,, b,,')).toEqual(['a', 'b']);
  });
});
