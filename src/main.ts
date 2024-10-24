import "../node_modules/ui/css/main.css";
import "./app/pg-app"; // Register "pg-app"

import { registerSW } from "virtual:pwa-register";

import { version } from "./data/version";

registerSW({
    onRegistered(r) {
        setTimeout(async () => {
            try {
                console.debug(
                    `[main] Update service... (currentVersion: ${version})`,
                );
                await r.update(); // NOTE: for now do auto update all the time
            } catch (err) {
                console.warn(`Auto update failed: ${err}`);
            }
        });
    },
});
