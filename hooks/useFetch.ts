import { useState, useEffect, useCallback } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseFetchOptions {
  immediate?: boolean;
  credentials?: RequestCredentials;
}

export function useFetch<T>(
  url: string,
  options: UseFetchOptions = {}
): FetchState<T> & { refetch: () => Promise<void> } {
  const { immediate = true, credentials = 'include' } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const res = await fetch(url, { credentials });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }, [url, credentials]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return { ...state, refetch: fetchData };
}

// Mutation hook for POST/PUT/DELETE
interface MutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

interface MutationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useMutation<T, V = Record<string, unknown>>(
  url: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
  options: MutationOptions<T> = {}
): MutationState<T> & { mutate: (variables?: V) => Promise<T | null> } {
  const [state, setState] = useState<MutationState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(
    async (variables?: V): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });

      try {
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: variables ? JSON.stringify(variables) : undefined,
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        setState({ data, loading: false, error: null });
        options.onSuccess?.(data);
        return data;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Unknown error';
        setState({ data: null, loading: false, error });
        options.onError?.(error);
        return null;
      }
    },
    [url, method, options]
  );

  return { ...state, mutate };
}

// Paginated fetch hook
interface PaginatedState<T> {
  items: T[];
  page: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
}

export function usePaginatedFetch<T>(
  baseUrl: string,
  initialPage = 1
): PaginatedState<T> & {
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  refetch: () => void;
} {
  const [page, setPage] = useState(initialPage);
  const [state, setState] = useState<Omit<PaginatedState<T>, 'page'>>({
    items: [],
    hasMore: true,
    loading: true,
    error: null,
  });

  const fetchPage = useCallback(async (pageNum: number) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${pageNum}`;
      const res = await fetch(url, { credentials: 'include' });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setState({
        items: data.results || data,
        hasMore: data.hasMore ?? (data.results?.length >= 20),
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    }
  }, [baseUrl]);

  useEffect(() => {
    fetchPage(page);
  }, [page, fetchPage]);

  return {
    ...state,
    page,
    nextPage: () => state.hasMore && setPage((p) => p + 1),
    prevPage: () => page > 1 && setPage((p) => p - 1),
    goToPage: setPage,
    refetch: () => fetchPage(page),
  };
}
