const loopback = host => ['localhost', '127.0.0.1', '[::1]', '::1'].includes(host);

export function resolveApiUrl(configured, browserHost) {
  if (!configured) return '/api';
  try {
    const url = new URL(configured);
    // A phone's localhost is the phone itself. Use the same-origin dev proxy.
    if (loopback(url.hostname) && browserHost && !loopback(browserHost)) return '/api';
  } catch { /* A relative API URL already uses the current device's host. */ }
  return configured;
}

