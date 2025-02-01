import "bootstrap-icons/font/bootstrap-icons.min.css";

import * as ui from "ui";
import { registerSW } from "virtual:pwa-register";

import * as utils from "./utils";
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

            // Render lists
            {
                group.items.innerHTML = "";
                for (const list of data.lists) {
                    const item = drawer.create.alertListItem({ data: list });
                    cleanup.push(item.destroy);
                    group.items.appendChild(item.element);
                }
            }

            // Initialize action button "download" - Download data packed in a handy zip archive
            group.actions.download!.onclick = async () => {
                try {
                    if (confirm(`Download ZIP?`)) {
                        await utils.downloadZIP("alert-lists");
                    }
                } catch (err) {
                    alert(err);
                }
            };
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

            // Render
            const group = query.drawerGroup("metal-sheets");

            // Render active lists first, then the rest
            {
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

                group.items.innerHTML = "";
                for (const list of [...activeLists, ...rest]) {
                    const item = drawer.create.metalSheetItem({ data: list });
                    cleanup.push(item.destroy);
                    group.items.appendChild(item.element);
                }
            }

            // Initialize action button "download" - Download data packed in a handy zip archive
            group.actions.download!.onclick = async () => {
                try {
                    if (confirm(`Download ZIP?`)) {
                        await utils.downloadZIP("metal-sheets");
                    }
                } catch (err) {
                    alert(err);
                }
            };

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

            // Render lists
            {
                group.items.innerHTML = "";
                for (const list of data.lists) {
                    const item = drawer.create.visItem({ data: list });
                    cleanup.push(item.destroy);
                    group.items.appendChild(item.element);
                }
            }

            // Initialize action button "download" - Download data packed in a handy zip archive
            group.actions.download!.onclick = async () => {
                try {
                    if (confirm(`Download ZIP?`)) {
                        await utils.downloadZIP("vis");
                    }
                } catch (err) {
                    alert(err);
                }
            };

            // Initialize action button "add" - Create a new vis list
            group.actions.add!.onclick = async () => {
                // Open dialog choosing load from file or create new vis list
                const data = await dialogs.vis();

                if (!data) {
                    return;
                }

                const ls = listStores.get("vis");
                try {
                    ls.addToStore([data]);
                } catch (err) {
                    alert(err);
                    group.actions.add!.click();
                    return;
                }
            };

            // Initialize action button "import-from-file" - Open file picker
            group.actions.importFromFile!.onclick = async () => {
                // Create input element of type file, click it and get the .txt type file
                const input = document.createElement("input");

                input.type = "file";
                input.accept = ".txt";
                input.multiple = true;

                input.onchange = () => {
                    if (!input.files) {
                        return;
                    }

                    for (const file of input.files) {
                        const reader = new FileReader();

                        reader.onload = async () => {
                            if (typeof reader.result !== "string") {
                                return;
                            }

                            const ls = listStores.get("vis");
                            let data: any;

                            try {
                                data = ls.validate(reader.result);
                            } catch (err) {
                                alert(err);
                                return;
                            }

                            if (data === null) {
                                alert(`Ungültige Daten für "${ls.title()}"!`);
                                return;
                            }

                            try {
                                ls.addToStore([data]);
                            } catch (err) {
                                alert(err);
                                return;
                            }
                        };

                        reader.onerror = () => {
                            alert(`Lesen der Datei "${file.name}" ist fehlgeschlagen!`);
                        };

                        reader.readAsText(file);
                    }
                };

                input.click();
            };
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
        title: "VIS",
        template: {
            selector: `template[name="vis"]`,
            onMount() {
                pages.vis.onMount();
            },
            onDestroy() {
                pages.vis.onDestroy();
            },
        },
    },

    product: {
        title: "VIS | Produkt",
        template: {
            selector: `template[name="product"]`,
            onMount() {
                pages.product.onMount();
            },
            onDestroy() {
                pages.product.onDestroy();
            },
        },
    },

    "vis-bookmarks": {}, // TODO: Continue here...
    "vis-data": {}, // TODO: ...or here
    special: {}, // TODO: ...or here
});

// Event Handlers

window.onhashchange = () => {
    drawer.utils.close();
};
