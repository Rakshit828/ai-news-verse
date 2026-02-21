// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,       // 5 minutes before data is considered stale
      retry: 1,                         // retry failed requests once
      refetchOnWindowFocus: false,      // don't refetch when window regains focus
    },
    mutations: {
      retry: 0,
    },
  },
})
