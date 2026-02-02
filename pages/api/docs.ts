import type { NextApiRequest, NextApiResponse } from 'next';

const apiDocs = {
  openapi: '3.0.0',
  info: {
    title: 'ClipConnect API',
    version: '1.0.0',
    description: 'API documentation for ClipConnect - a marketplace for hairstylists and clients',
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      description: 'API Server',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Users', description: 'User profile operations' },
    { name: 'Posts', description: 'Post management' },
    { name: 'Reviews', description: 'Review management' },
    { name: 'Messages', description: 'Messaging system' },
    { name: 'Notifications', description: 'Notification system' },
    { name: 'Bookings', description: 'Appointment booking' },
    { name: 'Search', description: 'Search functionality' },
  ],
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'role'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  name: { type: 'string' },
                  role: { type: 'string', enum: ['PRO', 'CLIENT'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User created successfully' },
          400: { description: 'Invalid input or email already in use' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout current user',
        responses: {
          200: { description: 'Logged out successfully' },
        },
      },
    },
    '/api/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request password reset email',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Reset email sent if account exists' },
        },
      },
    },
    '/api/profile/me': {
      get: {
        tags: ['Users'],
        summary: 'Get current user profile',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'User profile data' },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/api/profile/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user profile by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: { description: 'User profile data' },
          404: { description: 'User not found' },
        },
      },
    },
    '/api/posts': {
      get: {
        tags: ['Posts'],
        summary: 'Get posts with pagination',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'userId', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'List of posts' },
        },
      },
    },
    '/api/posts/create': {
      post: {
        tags: ['Posts'],
        summary: 'Create a new post',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['mediaUrls'],
                properties: {
                  mediaUrls: { type: 'array', items: { type: 'string' } },
                  caption: { type: 'string' },
                  styleTags: { type: 'array', items: { type: 'string' } },
                  hairTypeTags: { type: 'array', items: { type: 'string' } },
                  location: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Post created' },
          401: { description: 'Not authenticated' },
          403: { description: 'Only professionals can create posts' },
        },
      },
    },
    '/api/reviews/create': {
      post: {
        tags: ['Reviews'],
        summary: 'Create a review for a professional',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['professionalId', 'rating'],
                properties: {
                  professionalId: { type: 'integer' },
                  rating: { type: 'integer', minimum: 1, maximum: 5 },
                  text: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Review created' },
          401: { description: 'Not authenticated' },
          400: { description: 'Invalid input' },
        },
      },
    },
    '/api/messages': {
      get: {
        tags: ['Messages'],
        summary: 'Get conversations list',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'List of conversations' },
          401: { description: 'Not authenticated' },
        },
      },
      post: {
        tags: ['Messages'],
        summary: 'Send a message',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['receiverId', 'content'],
                properties: {
                  receiverId: { type: 'integer' },
                  content: { type: 'string', maxLength: 2000 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Message sent' },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/api/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Get user notifications',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'unreadOnly', in: 'query', schema: { type: 'boolean' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: { description: 'List of notifications' },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/api/bookings': {
      get: {
        tags: ['Bookings'],
        summary: 'Get user bookings',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'] } },
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['client', 'professional'] } },
        ],
        responses: {
          200: { description: 'List of bookings' },
          401: { description: 'Not authenticated' },
        },
      },
      post: {
        tags: ['Bookings'],
        summary: 'Create a booking request',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['professionalId', 'scheduledAt', 'duration'],
                properties: {
                  professionalId: { type: 'integer' },
                  scheduledAt: { type: 'string', format: 'date-time' },
                  duration: { type: 'integer', description: 'Duration in minutes' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Booking created' },
          401: { description: 'Not authenticated' },
          400: { description: 'Invalid input or time slot unavailable' },
        },
      },
    },
    '/api/search': {
      get: {
        tags: ['Search'],
        summary: 'Search for professionals',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Search query' },
          { name: 'location', in: 'query', schema: { type: 'string' } },
          { name: 'specialty', in: 'query', schema: { type: 'string' } },
          { name: 'hairType', in: 'query', schema: { type: 'string' } },
          { name: 'minRating', in: 'query', schema: { type: 'number' } },
        ],
        responses: {
          200: { description: 'Search results' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'clipconnect_token',
      },
    },
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Content-Type', 'application/json');
  res.json(apiDocs);
}
