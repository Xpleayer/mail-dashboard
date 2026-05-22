export async function n8nFetch(path: string, options?: RequestInit) {
  return fetch(`${process.env.N8N_API_URL}/api/v1${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-N8N-API-KEY": process.env.N8N_API_KEY!,
      ...(options?.headers ?? {}),
    },
  });
}