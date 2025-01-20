import { registerSW } from "virtual:pwa-register";

import * as query from "./utils-query";
import * as drawer from "./utils-drawer";
import * as globals from "./globals";

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

// Drawer Groups state management

query.drawerGroup("alert-lists").onclick = () => {
    const group = query.drawerGroup("alert-lists");
    globals.store.update("drawerGroup", (data) => {
        data.alertLists = {
            ...(data.alertLists || {}),
            open: group.open,
        };

        return data;
    });
};

// TODO: Router setup here
