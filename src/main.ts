import { registerSW } from "virtual:pwa-register";

import * as query from "./utils-query";
import * as drawer from "./utils-drawer";

const updateSW = registerSW({
    async onNeedRefresh() {
        if (confirm(`Update available`)) {
            await updateSW();
        }
    },
});

// Initialize AppBar button handlers

query.appBar_ButtonOpenDrawer().onclick = () => drawer.open();
query.drawerBackdrop().onclick = () => drawer.close();

// TODO: Router setup here
