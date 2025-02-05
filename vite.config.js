import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import tsconfigPaths from "vite-tsconfig-paths";

/** @type {import("vite-plugin-pwa").VitePWAOptions} */
const manifestForPlugIn = {
    strategies: "generateSW",
    registerType: "autoUpdate",
    includeAssets: [],
    manifest: {
        name: "PG: Vis",
        short_name: "pg-vis",
        icons: [
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
        ],
        theme_color: "hsl(240, 10%, 3.9%)",
        background_color: "hsl(240, 10%, 3.9%)",
        display: "standalone",
        scope: ".",
        start_url: "./",
        publicPath: "/pg-vis.github.io",
    },
};

export default defineConfig({
    plugins: [VitePWA(manifestForPlugIn), tsconfigPaths()],
    clearScreen: false,
    base: "/pg-vis.github.io/",

    //build: {
    //    outDir: "dist/",
    //},

    build: {
        outDir: "../pg-vis.github.io/",
    },
});
