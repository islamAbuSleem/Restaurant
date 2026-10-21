import type { ApiResponse } from "@restaurant/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  cookieHeader?: string;
  cache?: RequestCache;
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, cookieHeader, cache = "no-store" } = options;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    cache,
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let payload: ApiResponse<T>;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiRequestError("Unexpected server response", "INVALID_RESPONSE", response.status);
  }

  if (!payload.success) {
    throw new ApiRequestError(payload.error.message, payload.error.code, response.status);
  }
  return payload.data;
}

export async function safeApiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T | null> {
  try {
    return await apiFetch<T>(path, options);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[api] ${options.method ?? "GET"} ${path} failed:`, error);
    }
    return null;
  }
}

export { API_URL };
