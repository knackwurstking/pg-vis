import "../node_modules/ui/lib/css/main.css";

import "./app/components/pg-search-bar"; // Register "pg-search-bar"
import "./app/dialogs/pg-import-dialog"; // Register "pg-import-dialog"
import "./app/dialogs/pg-metal-sheet-entry-dialog"; // Register component
import "./app/dialogs/pg-metal-sheet-table-dialog"; // Register component
import "./app/pg-app"; // Register "pg-app"
import "./app/pg-drawer-item-gist"; // Register "pg-drawer-item-gist"
import "./app/pg-drawer-item-import"; // Register "pg-drawer-item-import"

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
