import type { NextApiResponse } from 'next';

// Standardized API response helpers

export function success<T>(res: NextApiResponse, data: T, status = 200) {
  return res.status(status).json({
    success: true,
    data,
  });
}

export function created<T>(res: NextApiResponse, data: T) {
  return success(res, data, 201);
}

export function error(
  res: NextApiResponse,
  message: string,
  status = 400
) {
  return res.status(status).json({
    success: false,
    error: message,
  });
}

export function unauthorized(res: NextApiResponse, message = 'Unauthorized') {
  return error(res, message, 401);
}

export function forbidden(res: NextApiResponse, message = 'Forbidden') {
  return error(res, message, 403);
}

export function notFound(res: NextApiResponse, message = 'Not found') {
  return error(res, message, 404);
}

export function methodNotAllowed(res: NextApiResponse) {
  return error(res, 'Method not allowed', 405);
}

export function badRequest(res: NextApiResponse, message: string) {
  return error(res, message, 400);
}

export function serverError(
  res: NextApiResponse,
  message = 'Internal server error'
) {
  return error(res, message, 500);
}

// Paginated response helper
export function paginated<T>(
  res: NextApiResponse,
  results: T[],
  page: number,
  perPage: number
) {
  return success(res, {
    results,
    page,
    hasMore: results.length >= perPage,
  });
}
