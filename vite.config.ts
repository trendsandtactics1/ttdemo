import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const plugins = [react()];

  if (mode === "development") {
    plugins.push(componentTagger());
  }

  return {
    server: {
      host: "0.0.0.0", // Ensures both IPv4 & IPv6 compatibility
      port: 8080,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, apikey',
        'Access-Control-Expose-Headers': 'Content-Range, X-Content-Range',
      },
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {}, // Keep default chunk splitting
      },
    },
  };
});
