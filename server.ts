import express from "express";
import path from "path";
import { spawn, ChildProcess } from "child_process";
import { createServer as createViteServer } from "vite";
import { createProxyMiddleware } from "http-proxy-middleware";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Start Python FastAPI backend on internal port 8000
  console.log("Starting Python FastAPI backend on 127.0.0.1:8000...");
  const pythonBackend: ChildProcess = spawn(
    "python3",
    ["-m", "uvicorn", "backend.app.main:app", "--host", "127.0.0.1", "--port", "8000"],
    { stdio: "inherit" }
  );

  const cleanup = () => {
    if (pythonBackend && !pythonBackend.killed) {
      console.log("Terminating Python backend...");
      pythonBackend.kill();
    }
  };
  process.on("exit", cleanup);
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  // Proxy /api requests to FastAPI backend
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://127.0.0.1:8000",
      changeOrigin: true,
      ws: true,
      on: {
        error: (err: any, _req: any, res: any) => {
          console.error("Backend proxy error:", err.message);
          if (res && !res.headersSent && typeof res.status === 'function') {
            res.status(503).json({
              error: "Backend is initializing. Please retry in a few moments.",
            });
          }
        },
      },
    })
  );

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FinPilot server listening on port ${PORT}`);
  });
}

startServer();
