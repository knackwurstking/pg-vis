import "bootstrap-icons/font/bootstrap-icons.min.css";

import * as ui from "ui";
import { registerSW } from "virtual:pwa-register";

import * as dialogs from "./dialogs";
import * as drawer from "./drawer";
import * as globals from "./globals";
import * as listStores from "./list-stores";
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
    ui.router.hash.goTo(null, "");
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

            // This will open the metal-sheet dialog
            group.actions.add!.onclick = async () => {
                const data = await dialogs.metalSheet();
                const formatInput = query.dialog_MetalSheet().format;

                if (!data) {
                    formatInput.ariaInvalid = null;
                    return;
                }

                // Format should not be empty
                if (!data.format) {
                    group.actions.add!.click();
                    formatInput.ariaInvalid = "";
                    return;
                }

                formatInput.ariaInvalid = null;

                const ls = listStores.get("metal-sheets");
                try {
                    ls.addToStore([data]);
                } catch (err) {
                    alert(err);
                    group.actions.add!.click();
                    return;
                }
            };
        },
        true,
    );
}

// Render drawer vis items
{
    let cleanup: (() => void)[] = [];
    globals.store.listen(
        "vis",
        async (data) => {
            cleanup.forEach((fn) => fn());
            cleanup = [];

            const group = query.drawerGroup("vis");

            group.items.innerHTML = "";
            for (const list of data.lists) {
                const item = drawer.create.visItem({ data: list });
                cleanup.push(item.destroy);
                group.items.appendChild(item.element);
            }

            // TODO: Initilalize action buttons "add" - Open file picker
        },
        true,
    );
}

// Initialize Router

ui.router.hash.init(query.routerTarget(), {
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
                pages.metalSheets.onMount();
            },
            onDestroy() {
                pages.metalSheets.onDestroy();
            },
        },
    },

    vis: {
        // TODO: ...
    },

    "vis-bookmarks": {},
    "vis-data": {},
    special: {},
});

// Event Handlers

window.onhashchange = () => {
    drawer.utils.close();
};
