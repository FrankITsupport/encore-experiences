const apiBase = `${import.meta.env.BASE_URL}api/index.php`;
let csrfToken = "";

type RequestOptions = { method?: "GET" | "POST" | "PUT" | "DELETE"; body?: unknown };

export async function api<T>(resource: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${apiBase}?${resource}`, {
    method: options.method || "GET",
    credentials: "same-origin",
    headers: options.body === undefined ? {} : { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const result = await response.json().catch(() => ({ error: "The server did not return a valid response." }));
  if (!response.ok) throw new Error(result.error || `Request failed (${response.status}).`);
  return result as T;
}

export type AdminSession = { email: string; csrf: string };

export async function getSession(): Promise<AdminSession | null> {
  const session = await api<AdminSession | null>("action=session");
  csrfToken = session?.csrf || "";
  return session;
}

export async function login(email: string, password: string): Promise<AdminSession> {
  const session = await api<AdminSession>("action=login", { method: "POST", body: { email, password } });
  csrfToken = session.csrf;
  return session;
}

export async function logout(): Promise<void> {
  await api("action=logout", { method: "POST", body: {} });
  csrfToken = "";
}

export function uploadFile(file: File, folder: string, onProgress: (percent: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", `${apiBase}?action=upload&folder=${encodeURIComponent(folder)}`);
    request.withCredentials = true;
    request.setRequestHeader("X-CSRF-Token", csrfToken);
    request.upload.onprogress = (event) => { if (event.lengthComputable) onProgress(Math.round(event.loaded / event.total * 100)); };
    request.onload = () => {
      try {
        const result = JSON.parse(request.responseText);
        if (request.status >= 200 && request.status < 300) resolve(result.path);
        else reject(new Error(result.error || "Upload failed."));
      } catch { reject(new Error("The upload server did not return a valid response.")); }
    };
    request.onerror = () => reject(new Error("Upload failed. Check the connection and try again."));
    const form = new FormData();
    form.append("file", file);
    request.send(form);
  });
}
