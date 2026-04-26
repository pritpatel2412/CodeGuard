let cachedToken: string | null = null;

export function clearCsrfToken() {
  cachedToken = null;
}

export async function getCsrfToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  try {
    const res = await fetch("/api/csrf", { credentials: "include" });
    if (!res.ok) return null;
    const data = (await res.json()) as { csrfToken?: string };
    if (data.csrfToken) {
      cachedToken = data.csrfToken;
      return cachedToken;
    }
    return null;
  } catch {
    return null;
  }
}
