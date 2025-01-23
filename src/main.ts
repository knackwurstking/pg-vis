import "bootstrap-icons/font/bootstrap-icons.min.css";

import * as ui from "ui";
import { registerSW } from "virtual:pwa-register";

import * as globals from "./globals";
import * as pages from "./pages";
import * as types from "./types";
import * as drawer from "./utils-drawer";
import * as query from "./utils-query";

// PWA Updates

const updateSW = registerSW({
    async onNeedRefresh() {
        if (confirm(`Update available`)) {
            await updateSW();
        }
    },
});

// Initialize AppBar

query.appBar_ButtonOpenDrawer().onclick = () => drawer.open();
query.drawerBackdrop().onclick = () => drawer.close();

// Initialize Drawer

const drawerGistIDsButton = query.drawerGistIDsButton();
drawerGistIDsButton.onclick = () => {
    location.hash = "";
    drawer.close();
};

for (const name of [
    "alert-lists",
    "metal-sheets",
    "vis",
    "vis-bookmarks",
    "vis-data",
    "special",
] as types.DrawerGroups[]) {
    const group = query.drawerGroup(name);
    group.root.onclick = () =>
        setTimeout(() => {
            globals.store.update("drawerGroup", (data) => {
                data[name] = {
                    ...(data[name] || {}),
                    open: group.root.open,
                };

                return data;
            });
        });
}

// Initialize Router

ui.router.hash(query.routerTarget(), {
    "/": {
        title: "VIS | Gist IDs",
        template: {
            selector: `template[name="gist-ids"]`,
            onMount: () => pages.gistIDs.onMount(),
            onDestroy: () => pages.gistIDs.onDestroy(),
        },
    },

    "alert-lists": {},
    "metal-sheets": {},
    vis: {},
    "vis-bookmarks": {},
    "vis-data": {},
    special: {},
});

// Event Handlers

window.onhashchange = () => {
    drawer.close();
};
