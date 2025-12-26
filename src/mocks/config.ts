export type MockAuthMode = "strict" | "relaxed";

export interface MockConfig {
  enabled: boolean;
  seed: number;
  count: number;
  auth: MockAuthMode;
  errorRate: number;
  notFound: boolean;
}

function parseBoolean(value: string | undefined): boolean | undefined {
  if (!value) return undefined;
  if (value === "1" || value.toLowerCase() === "true") return true;
  if (value === "0" || value.toLowerCase() === "false") return false;
  return undefined;
}

function parseNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function shouldEnableMocks(): boolean {
  const buildFlag = parseBoolean(import.meta.env.VITE_USE_MOCKS);
  console.log("Build flag:", buildFlag);
  if (buildFlag !== undefined) return buildFlag;

  if (typeof window === "undefined") return false;

  const url = new URL(window.location.href);
  if (url.searchParams.get("mock") === "1") return true;

  return window.localStorage.getItem("USE_MOCKS") === "1";
}

export function readMockConfig(): MockConfig {
  const enabled = shouldEnableMocks();
  const seed = parseNumber(import.meta.env.VITE_MOCK_SEED) ?? 1;
  const count = parseNumber(import.meta.env.VITE_MOCK_COUNT) ?? 20;
  const errorRateRaw = parseNumber(import.meta.env.VITE_MOCK_ERROR_RATE) ?? 0;
  const errorRate = Math.min(1, Math.max(0, errorRateRaw));
  const auth = (import.meta.env.VITE_MOCK_AUTH as MockAuthMode) ?? "relaxed";
  const notFound = parseBoolean(import.meta.env.VITE_MOCK_NOT_FOUND) ?? true;

  return { enabled, seed, count, auth, errorRate, notFound };
}
