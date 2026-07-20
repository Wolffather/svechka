const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api";
// Recordings longer than ~25s make the backend fall back to Yandex SpeechKit's
// long-running recognition API, which polls for up to 180s before giving up — this must
// stay comfortably above that ceiling or the frontend aborts a request the backend is
// still legitimately working on.
const REQUEST_TIMEOUT_MS = 220_000;
const TOKEN_KEY = "svechka_token";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function humanReadableMessage(status: number): string {
  switch (status) {
    case 401:
      return "Неверный email или пароль.";
    case 409:
      return "Запись за этот день уже существует.";
    case 413:
      return "Аудиофайл слишком большой (максимум 25 МБ).";
    case 504:
      return "AI-сервис сейчас недоступен. Попробуйте ещё раз через минуту.";
    default:
      return "Что-то пошло не так. Попробуйте ещё раз.";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const headers = new Headers(options.headers);
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      let message = humanReadableMessage(response.status);
      try {
        const body = (await response.json()) as { message?: string };
        if (body?.message) {
          message = body.message;
        }
      } catch {
        // response body wasn't JSON, fall back to the generic message
      }
      throw new ApiError(response.status, message);
    }

    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(0, "Сервер не отвечает слишком долго. Проверьте соединение и попробуйте ещё раз.");
    }
    throw new ApiError(0, "Не удалось связаться с сервером. Проверьте интернет-соединение и попробуйте ещё раз.");
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  postJson: <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  putJson: <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  postForm: <T>(path: string, form: FormData) => request<T>(path, { method: "POST", body: form }),
};

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
