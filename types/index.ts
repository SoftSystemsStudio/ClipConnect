// Shared types for API responses and models

// User types
export type UserRole = 'PRO' | 'CLIENT';

export interface User {
  id: number;
  email: string;
  name: string | null;
  role: UserRole;
  profilePhotoUrl: string | null;
  location: string | null;
  createdAt: string;
}

export interface ProfessionalProfile {
  id: number;
  userId: number;
  bio: string | null;
  specialties: string[];
  hairTypesServed: string[];
  priceRange: string | null;
  shopName: string | null;
  shopAddress: string | null;
  bookingUrl: string | null;
  experienceYears: number | null;
  certifications: string[];
  averageRating: number | null;
  reviewsCount: number;
  minCutDurationMinutes: number | null;
  maxCutDurationMinutes: number | null;
}

export interface ClientProfile {
  id: number;
  userId: number;
  hairTypes: string[];
  usualStyles: string[];
  preferredPriceRange: string | null;
  defaultCity: string | null;
  haircutProfilePhotos: string[];
  typicalCutDurationMinutes: number | null;
}

export interface UserWithProfile extends User {
  professional?: ProfessionalProfile;
  client?: ClientProfile;
}

// Post types
export interface Post {
  id: number;
  professionalId: number;
  mediaUrls: string[];
  caption: string | null;
  styleTags: string[];
  hairTypeTags: string[];
  location: string | null;
  createdAt: string;
  likeCount: number;
  saveCount: number;
  estimatedDurationMinutes: number | null;
  likedByCurrentUser?: boolean;
  savedByCurrentUser?: boolean;
  professional?: { name: string };
}

// Review types
export interface Review {
  id: number;
  professionalId: number;
  clientId: number;
  rating: number;
  text: string | null;
  createdAt: string;
  actualDurationMinutes: number | null;
  client?: { name: string };
  professional?: { name: string };
}

// Tool types
export interface Tool {
  id: number;
  professionalId: number;
  name: string;
  category: string;
  description: string | null;
  affiliateUrl: string | null;
  clickCount: number;
  createdAt: string;
}

// Follow types
export interface FollowCounts {
  followers: number;
  following: number;
}

export interface FollowListItem {
  id: number;
  name: string | null;
  profilePhotoUrl: string | null;
  specialties?: string[];
  averageRating?: number;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  results: T[];
  page: number;
  hasMore: boolean;
  total?: number;
}

// Search params
export interface SearchParams {
  city?: string;
  styleTags?: string[];
  hairTypes?: string[];
  minRating?: number;
  priceMin?: string;
  priceMax?: string;
  q?: string;
  page?: number;
}
