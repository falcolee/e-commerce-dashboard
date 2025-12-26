import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AppThemeProvider } from "./providers/AppThemeProvider";

async function bootstrap() {
  const { enableMocking } = await import("./mocks");
  await enableMocking();

  createRoot(document.getElementById("root")!).render(
    <AppThemeProvider>
      <App />
    </AppThemeProvider>
  );
}

bootstrap();
