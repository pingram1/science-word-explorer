export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiFailure {
  ok: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export async function fetchApi<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = (await res.json()) as ApiResponse<T>;

  if (!res.ok || !json.ok) {
    const message = json.ok === false ? json.error : "Request failed";
    throw new Error(message);
  }

  return json.data;
}
