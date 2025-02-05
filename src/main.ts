import "../node_modules/ui/lib/css/main.css";

import "@app";

import { registerSW } from "virtual:pwa-register";

registerSW({
    onRegistered(r) {
        setTimeout(async () => {
            try {
                await r?.update(); // Auto update
            } catch (err) {
                console.warn(`Auto update failed: ${err}`);
            }
        });
    },
});
