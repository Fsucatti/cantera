/** Small helpers for calling the API from components. */
import { useCallback, useEffect, useState } from "react";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T = unknown>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method: options.method ?? "GET",
      headers: options.body === undefined ? undefined : { "content-type": "application/json" },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(0, "Couldn't reach the server. Check your connection.");
  }
  if (!response.ok) {
    let message = "Something went wrong. Try again.";
    try {
      message = ((await response.json()) as { error?: string }).error ?? message;
    } catch {
      // Keep the general message.
    }
    if (response.status === 401 && path !== "/auth/login" && path !== "/me/password") {
      window.dispatchEvent(new Event("cantera:signed-out"));
    }
    throw new ApiError(response.status, message);
  }
  return (await response.json()) as T;
}

export interface Loaded<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => Promise<void>;
}

/** Loads a path, and reloads when the path changes or on request. */
export function useApi<T>(path: string | null): Loaded<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(path !== null);

  const reload = useCallback(async () => {
    if (path === null) return;
    try {
      setData(await api<T>(path));
      setError(null);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    setLoading(true);
    void reload();
  }, [reload]);

  return { data, error, loading, reload };
}

export function timeAgo(timestamp: number): string {
  const minutes = Math.round((Date.now() - timestamp) / 60_000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return days < 30 ? `${days} days ago` : new Date(timestamp).toLocaleDateString();
}

/** Resizes a picture in the browser, so the stored version is small. */
export async function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.max(maxWidth / bitmap.width, maxHeight / bitmap.height);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = maxWidth;
  canvas.height = maxHeight;
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  context.drawImage(bitmap, (maxWidth - width) / 2, (maxHeight - height) / 2, width, height);
  bitmap.close();
  return canvas.toDataURL("image/webp", 0.75);
}
