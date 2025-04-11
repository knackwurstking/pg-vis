import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const icons = [
    {
        src: "assets/icons/pwa-64x64.png",
        sizes: "64x64",
        type: "image/png",
    },
    {
        src: "assets/icons/pwa-192x192.png",
        sizes: "192x192",
        type: "image/png",
    },
    {
        src: "assets/icons/pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
    },
    {
        src: "assets/icons/maskable-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
    },
];

const screenshots = [];

/** @type {import("vite-plugin-pwa").VitePWAOptions} */
const manifestForPlugIn = {
    strategies: "generateSW",
    registerType: "prompt",
    includeAssets: [
        "CHANGELOG.md",
        "assets/fonts/bootstrap-icons.woff",
        "assets/fonts/bootstrap-icons.woff2",
        "assets/icons/icon.png",
        "assets/icons/favicon.ico",
        "assets/icons/apple-touch-icon-180x180.png",
    ],
    manifest: {
        name: "PG: Vis",
        short_name: "pg-vis",
        icons: icons,
        screenshots: screenshots,
        theme_color: "#09090b",
        background_color: "#09090b",
        display: "standalone",
        scope: ".",
        start_url: "./",
        publicPath: process.env.PGVISPWA_SERVER_PATH,
    },
};

export default defineConfig({
    plugins: [VitePWA(manifestForPlugIn)],
    clearScreen: false,
    base: process.env.PGVISPWA_SERVER_PATH,

    build: {
        outDir: "dist",
    },

    define: {
        "process.env.PWA": process.env.PWA || false,
        "process.env.CAPACITOR": process.env.CAPACITOR || false,
    },
});
