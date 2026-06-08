const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export async function api<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message ?? "요청 처리 중 오류가 발생했습니다.");
  }

  return data as T;
}