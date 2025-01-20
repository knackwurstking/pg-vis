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

{
    const drawer = query.drawer();

    query.appBar_ButtonOpenDrawer().onclick = () => {
        drawer.setAttribute("open", "");
    };

    query.drawerBackdrop().onclick = () => {
        drawer.removeAttribute("open");
    };
}

// TODO: Router setup here
