import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "src/assets/map/NewOfficeMap", // Path to your JSON
          dest: "src/assets/map", // Output directory in `dist`
        },
        {
          src: "src/assets/logo", // All sprites
          dest: "src/assets",
        },
      ],
    }),
    react(),
  ],
});
