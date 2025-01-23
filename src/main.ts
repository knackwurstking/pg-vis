import "bootstrap-icons/font/bootstrap-icons.min.css";

import * as ui from "ui";
import { registerSW } from "virtual:pwa-register";

import * as gist from "./gist";
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

window.onfocus = async () => {
    console.debug(`Window onfocus event called... Check for auto-update stuff...`);

    const storeKeysToCheck: types.DrawerGroups[] = [
        "alert-lists",
        "metal-sheets",
        "vis",
        "vis-data",
        "special",
    ];

    let needToReload = false;
    let message = `Updated Gist Repos`;
    for (const storeKey of storeKeysToCheck) {
        if (
            !globals.store.get(storeKey)!.gist?.autoUpdate &&
            !globals.store.get(storeKey)!.gist?.id
        ) {
            continue;
        }

        try {
            const { id, revision } = globals.store.get(storeKey)!.gist!;
            if (!(await gist.shouldUpdate(id, revision))) {
                continue;
            }

            const data = await gist.pull(storeKey, id);

            needToReload = true;
            message += `\n${storeKey}: ${id} -> ${data.gist?.id || "?"}`;

            globals.store.set(storeKey, data);
        } catch (err) {
            alert(`Etwas ist schiefgelaufen: ${err}`);
        }
    }

    if (needToReload) {
        alert(message);
        location.reload(); // NOTE: Maybe I should just reload drawer items and the current page here
    }
};
