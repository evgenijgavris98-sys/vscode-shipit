/**
 * Minimal, read-only MiroFish connectivity probe.
 *
 * Security boundary: fixed /health path, loopback-only URL, GET only,
 * no credentials, no user-controlled headers, bounded timeout, no redirects.
 * This does not start simulations or upload BIORICHEBRAIN data.
 */
export interface MiroFishHealth {
  ok: boolean;
  status: number;
  service?: string;
  message: string;
}

export async function checkMiroFishHealth(
  baseUrl = "http://127.0.0.1:5001",
  timeoutMs = 3000,
): Promise<MiroFishHealth> {
  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new Error("MiroFish URL is invalid.");
  }

  const host = url.hostname.toLowerCase();
  const isLoopback = host === "127.0.0.1" || host === "localhost" || host === "[::1]" || host === "::1";
  if (!isLoopback || (url.protocol !== "http:" && url.protocol !== "https:")) {
    throw new Error("MiroFish health check is restricted to localhost/loopback.");
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error("MiroFish URL must not contain credentials, query parameters, or fragments.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.max(500, Math.min(timeoutMs, 5000)));
  try {
    const endpoint = new URL("/health", url);
    const response = await fetch(endpoint, {
      method: "GET",
      headers: { Accept: "application/json" },
      redirect: "error",
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      return { ok: false, status: response.status, message: `MiroFish health endpoint returned HTTP ${response.status}.` };
    }

    const body: unknown = await response.json();
    if (!body || typeof body !== "object" || !("status" in body) || body.status !== "ok") {
      return { ok: false, status: response.status, message: "MiroFish responded, but its health payload was not recognized." };
    }

    const service = "service" in body && typeof body.service === "string" ? body.service : "MiroFish";
    return { ok: true, status: response.status, service, message: "MiroFish health check passed." };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("MiroFish health check timed out.");
    }
    throw new Error("MiroFish is not reachable on the configured loopback address.");
  } finally {
    clearTimeout(timeout);
  }
}
