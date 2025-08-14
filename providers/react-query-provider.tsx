"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

interface ReactQueryProviderProps {
  children: ReactNode;
}

interface ErrorWithResponse {
  response?: {
    status: number;
  };
}

function isErrorWithResponse(error: unknown): error is ErrorWithResponse {
  return (
    error !== null &&
    typeof error === "object" &&
    "response" in error &&
    typeof (error as ErrorWithResponse).response === "object"
  );
}

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000, // 1 minute
            retry: (failureCount, error: unknown) => {
              // Don't retry on 4xx errors except for 408, 429
              if (isErrorWithResponse(error)) {
                const status = error.response?.status;
                if (status && status >= 400 && status < 500) {
                  if (status === 408 || status === 429) {
                    return failureCount < 3;
                  }
                  return false;
                }
              }
              // Retry on other errors up to 3 times
              return failureCount < 3;
            },
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
