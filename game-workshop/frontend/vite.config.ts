import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
export default defineConfig(({ mode }) => {
  const target =
    loadEnv(mode, ".", "WORKSHOP_").WORKSHOP_API_TARGET ??
    "http://127.0.0.1:8080";
  if (!/^http:\/\/127\.0\.0\.1:\d{2,5}$/.test(target))
    throw new Error("本地预览的后端必须位于127.0.0.1。");
  return {
    plugins: [react(), tailwind()],
    server: {
      port: 5173,
      strictPort: true,
      proxy: { "/api": target, "/health": target },
    },
  };
});
