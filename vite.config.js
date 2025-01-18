import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const icons = [
    {
        src: "icons/pwa-64x64.png",
        sizes: "64x64",
        type: "image/png",
    },
    {
        src: "icons/pwa-192x192.png",
        sizes: "192x192",
        type: "image/png",
    },
    {
        src: "icons/pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
    },
    {
        src: "icons/maskable-icon-512x512.png",
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
    includeAssets: ["CHANGELOG.md"],
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
        publicPath: "/pg-vis-dev.github.io",
    },
};

export default defineConfig({
    plugins: [VitePWA(manifestForPlugIn)],
    clearScreen: false,
    base: "/pg-vis-dev.github.io/",

    build: {
        outDir: "../pg-vis-dev.github.io/",
    },
});
