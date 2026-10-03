import basicSsl from "@vitejs/plugin-basic-ssl";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [basicSsl()],
    server: {
        port: 5173,
        strictPort: true,
        open: true,
    },
});
