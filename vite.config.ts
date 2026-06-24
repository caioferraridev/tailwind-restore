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
  name: "Plataforma Azas",
  short_name: "Azas",
  description: "CRM Inteligente para Agências",

  theme_color: "#000000",
  background_color: "#ffffff",

  display: "standalone",
  orientation: "portrait",

  start_url: "/",
  scope: "/",

  icons: [
    {
      src: "/pwa-192x192.png",
      sizes: "192x192",
      type: "image/png"
    },
    {
      src: "/pwa-512x512.png",
      sizes: "512x512",
      type: "image/png"
    },
    {
      src: "/pwa-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable"
    }
  ]
}
      }),
    ],
  },
});