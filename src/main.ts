import "../node_modules/ui/lib/css/main.css";

import "@app";

import { registerSW } from "virtual:pwa-register";

import { version } from "@constants";

registerSW({
    onRegistered(r) {
        setTimeout(async () => {
            try {
                console.debug(`Update service... (currentVersion: ${version})`);
                await r?.update(); // Auto update
            } catch (err) {
                console.warn(`Auto update failed: ${err}`);
            }
        });
    },
});
