import { setupWorker } from "msw/browser";
import { createHandlers } from "./createHandlers";
import { readMockConfig } from "./config";
import { mockSpec } from "./generated/spec";

export async function startMockWorker() {
  const config = readMockConfig();
  if (!config.enabled) return;

  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1/admin";
  const handlers = createHandlers({
    spec: mockSpec,
    apiBaseUrl,
    seed: config.seed,
    count: config.count,
    auth: config.auth,
    notFound: config.notFound,
    errorRate: config.errorRate,
  });

  const worker = setupWorker(...handlers);

  await worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: { url: "/mockServiceWorker.js" },
    // Ensure the worker is ready before continuing
    quiet: false,
  });
}
