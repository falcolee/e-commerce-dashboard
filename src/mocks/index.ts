import { shouldEnableMocks } from "./config";

export async function enableMocking(): Promise<void> {
  if (!shouldEnableMocks()) return;
  const { startMockWorker } = await import("./browser");
  await startMockWorker();
}

