export async function api<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(path, {
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
