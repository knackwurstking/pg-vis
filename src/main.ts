import "../node_modules/ui/css/main.css";
import "./app/pg-app"; // Register "pg-app"

import { registerSW } from "virtual:pwa-register";
import { version } from "./constants";

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
