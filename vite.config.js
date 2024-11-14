import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import tsconfigPaths from "vite-tsconfig-paths";

/** @type {import("vite-plugin-pwa").VitePWAOptions} */
const manifestForPlugIn = {
    strategies: "generateSW",
    registerType: "autoUpdate",
    includeAssets: [
        "/assets/fonts/Recursive_VF_1.085--subset_range_english_basic.woff2",
        "/assets/fonts/Recursive_VF_1.085--subset_range_latin_1_punc.woff2",
        "/assets/fonts/Recursive_VF_1.085--subset_range_remaining.woff2",
        "/assets/fonts/Recursive_VF_1.085--subset_range_latin_1.woff2",
        "/assets/fonts/Recursive_VF_1.085--subset_range_latin_ext.woff2",
        "/assets/fonts/Recursive_VF_1.085--subset_range_vietnamese.woff2",
        "/themes/gruvbox.css",
        "/themes/original.css",
        "CHANGELOG.md",
    ],
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
        publicPath: "/pg-vis-dev.github.io",
    },
};

export default defineConfig({
    plugins: [VitePWA(manifestForPlugIn), tsconfigPaths()],
    clearScreen: false,
    base: "/pg-vis-dev.github.io/",

    //build: {
    //    outDir: "dist/",
    //},

    build: {
        outDir: "../pg-vis-dev.github.io/",
    },
});
