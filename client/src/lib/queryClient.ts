import { QueryClient, QueryFunction } from "@tanstack/react-query";

import { useErrorStore } from "./error-store";
import { getCsrfToken } from "./csrf";

function userSafeErrorMessage(status: number, rawBody: string): string {
  if (status === 403) return "This action was blocked. Try refreshing the page and signing in again.";
  if (status === 401) return "You need to sign in to continue.";
  if (status === 404) return "The requested resource was not found.";
  if (status === 429) return "Too many requests. Please wait and try again.";
  if (status >= 500) return "Something went wrong on our side. Please try again later.";
  if (rawBody.length > 200) return `Request failed (${status}).`;
  return `Request failed (${status}).`;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Handle specific error cases globally
    if (res.status === 429) {
      useErrorStore.getState().showError("rate_limit", "Too many requests");
    } else if (res.status === 401) {
      // Create a specific handling for 401 if needed, or stick to the modal
      useErrorStore.getState().showError("unauthorized", "Unauthorized access");
    } else if (res.status >= 500) {
      useErrorStore.getState().showError("server_error", "Internal server error");
    }

    const text = (await res.text()) || res.statusText;
    const safe = userSafeErrorMessage(res.status, text);
    throw new Error(safe);
  }
}

const UNSAFE = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {};
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  if (UNSAFE.has(method.toUpperCase()) && url.startsWith("/api") && !url.includes("/webhooks/")) {
    const csrf = await getCsrfToken();
    if (csrf) {
      headers["X-CSRF-Token"] = csrf;
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      const res = await fetch(queryKey.join("/") as string, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(userSafeErrorMessage(res.status, text));
      }
      return await res.json();
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
