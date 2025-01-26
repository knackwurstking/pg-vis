import "bootstrap-icons/font/bootstrap-icons.min.css";

import * as ui from "ui";
import { registerSW } from "virtual:pwa-register";

import * as drawer from "./drawer";
import * as globals from "./globals";
import * as pages from "./pages";
import * as types from "./types";
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

query.appBar_ButtonOpenDrawer().onclick = () => drawer.utils.open();
query.drawerBackdrop().onclick = () => drawer.utils.close();

// Initialize Drawer

const drawerGistIDsButton = query.drawerGistIDsButton();
drawerGistIDsButton.onclick = () => {
    globals.router.goTo(null, "");
    drawer.utils.close();
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

// Initialize Main Event Handlers (store)

// Render drawer alert-lists items
{
    let cleanup: (() => void)[] = [];
    globals.store.listen(
        "alert-lists",
        async (data) => {
            cleanup.forEach((fn) => fn());
            cleanup = [];

            const group = query.drawerGroup("alert-lists");
            group.items.innerHTML = "";
            for (const list of data.lists) {
                const item = drawer.create.alertListItem({ data: list });
                cleanup.push(item.destroy);
                group.items.appendChild(item.element);
            }
        },
        true,
    );
}

// Render drawer metal-sheets items
{
    let cleanup: (() => void)[] = [];
    globals.store.listen(
        "metal-sheets",
        async (data) => {
            cleanup.forEach((fn) => fn());
            cleanup = [];

            // Sort active lists by press
            let activeLists: types.MetalSheet[] = [];
            const rest: types.MetalSheet[] = [];
            for (const list of data.lists) {
                if (list.data.press > -1) {
                    activeLists.push(list);
                } else {
                    rest.push(list);
                }
            }

            // Sort active lists by press from low to high
            activeLists = activeLists.sort((a, b) => (a.data.press > b.data.press ? 1 : -1));

            // Render
            const group = query.drawerGroup("metal-sheets");
            group.items.innerHTML = "";
            for (const list of [...activeLists, ...rest]) {
                const item = drawer.create.metalSheetItem({ data: list });
                cleanup.push(item.destroy);
                group.items.appendChild(item.element);
            }
        },
        true,
    );
}

// Initialize Router

ui.router.hash(query.routerTarget(), {
    "/": {
        title: "VIS | Gist IDs",
        template: {
            selector: `template[name="gist-ids"]`,
            onMount() {
                pages.gistIDs.onMount();
            },
            onDestroy() {
                pages.gistIDs.onDestroy();
            },
        },
    },

    "alert-lists": {
        title: "VIS | Alarm Listen",
        template: {
            selector: `template[name="alert-lists"]`,
            onMount() {
                pages.alertLists.onMount();
            },
            onDestroy() {
                pages.alertLists.onDestroy();
            },
        },
    },

    alert: {
        title: "VIS | Alarm",
        template: {
            selector: `template[name="alert"]`,
            onMount() {
                pages.alert.onMount();
            },
            onDestroy() {
                pages.alert.onDestroy();
            },
        },
    },

    "metal-sheets": {
        title: "VIS | Blech Listen",
        template: {
            selector: `template[name="metal-sheets"]`,
            onMount() {
                pages.alert.onMount();
            },
            onDestroy() {
                pages.alert.onDestroy();
            },
        },
    },
    vis: {},
    "vis-bookmarks": {},
    "vis-data": {},
    special: {},
});

// Event Handlers

window.onhashchange = () => {
    drawer.utils.close();
};
