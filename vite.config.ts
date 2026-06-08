import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  tanstackStart: {
    server: {
      entry: "server",
    },
  },

  vite: {
    plugins: [
      VitePWA({
        registerType: "autoUpdate",

        devOptions: {
          enabled: true,
        },

        manifest: {
          name: "Sistema Azas",
          short_name: "Azas",
          description: "CRM e Gestão da Agência Azas",

          theme_color: "#000000",
          background_color: "#ffffff",

          display: "standalone",
          orientation: "portrait",

          icons: [
            {
              src: "/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
      }),
    ],
  },
});