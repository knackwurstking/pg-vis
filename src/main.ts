import { registerSW } from "virtual:pwa-register";

import * as query from "./query";

const updateSW = registerSW({
    async onNeedRefresh() {
        if (confirm(`Update available`)) {
            await updateSW();
        }
    },
});

// Initialize AppBar button handlers

const openDrawerButton = query.appBar_ButtonOpenDrawer();
openDrawerButton.onclick = () => {
    // TODO: Open the drawer
};

// TODO: Router setup here
