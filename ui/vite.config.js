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
        "assets/fonts/bootstrap-icons.woff",
        "assets/fonts/bootstrap-icons.woff2",
        "assets/icons/icon.png",
        "assets/icons/favicon.ico",
        "assets/icons/apple-touch-icon-180x180.png",
    ],
    manifest: {
        name: "PG: Vis",
        short_name: "PG Vis",
        icons: icons,
        screenshots: screenshots,
        theme_color: "#000000",
        background_color: "#000000",
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

    preview: {
        port: 9021, // NOTE: This is the port is use in my rpi-server-project
    },

    build: {
        outDir:
            process.env.MODE === "capacitor" ? "./dist-capacitor" : "./dist",
    },

    define: {
        "process.env.MODE": JSON.stringify(process.env.MODE),
    },
});
