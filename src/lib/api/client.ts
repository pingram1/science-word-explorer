export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiFailure {
  ok: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export async function fetchJsonApi<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = (await res.json()) as ApiResponse<T> | T;

  if (typeof json === "object" && json !== null && "ok" in json) {
    if (!res.ok || !json.ok) {
      const message = json.ok === false ? json.error : "Request failed";
      throw new Error(message);
    }
    return json.data;
  }

  if (!res.ok) {
    throw new Error("Request failed");
  }

  return json as T;
}
