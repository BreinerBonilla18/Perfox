import { QueryClient } from '@tanstack/react-query';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Every read hits local SQLite, so data is fresh by definition: it only
        // changes through a mutation, and mutations invalidate the keys.
        staleTime: Infinity,
        gcTime: 1000 * 60 * 30,
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
