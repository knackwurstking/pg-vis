import * as ui from "ui";

import * as listsStore from "./list-stores";
import * as types from "./types";

export const metalSheetSlots = [
    "Stärke",
    "Marke (Höhe)",
    "Blech Stempel",
    "Blech Marke",
    "Stf. P2 - P5",
    "Stf. P0",
];

export const flakesTowerSlots = ["A", "C", "E", "G", "I", "K"];
export const flakesPressSlots = ["P0", "P4", "P5"];
export const flakesPressSlotsFull = ["Presse 0", "Presse 4", "Presse 5"];

export const store = createStore();

export function getVisData(listKey: string): types.VisData | null {
    const ls = listsStore.get("vis-data");

    const list = store.get("vis-data")!.lists.find((list) => {
        return ls.listKey(list) === listKey;
    });

    return list || null;
}

export function getVisBookmarks(listKey: string): types.Bookmarks | null {
    const ls = listsStore.get("vis-bookmarks");

    const list = store.get("vis-bookmarks")!.lists.find((list) => {
        return ls.listKey(list) === listKey;
    });

    return list || null;
}

export function getProduct(listKey: string, index: number): types.Product | null {
    const list = getVis(listKey);
    if (!list) {
        return null;
    }

    return list.data[index] || null;
}

export function getAlertList(listKey: string): types.AlertList | null {
    const ls = listsStore.get("alert-lists");

    const list = store.get("alert-lists")!.lists.find((list) => {
        return ls.listKey(list) === listKey;
    });

    return list || null;
}

export function getVis(listKey: string): types.Vis | null {
    const ls = listsStore.get("vis");

    const list = store.get("vis")!.lists.find((list) => {
        return ls.listKey(list) === listKey;
    });

    return list || null;
}

export function getMetalSheet(listKey: string): types.MetalSheet | null {
    const ls = listsStore.get("metal-sheets");

    const list = store.get("metal-sheets")!.lists.find((list) => {
        return ls.listKey(list) === listKey;
    });

    return list || null;
}

export function getAlert(listKey: string, index: number): types.Alert | null {
    const list = getAlertList(listKey);
    if (!list) {
        return null;
    }

    return list.data[index] || null;
}

function createStore(): types.PGStore {
    console.debug("create store");
    const storePrefix = "pg-vis-dev:";
    const store: types.PGStore = new ui.Store(storePrefix);

    store.set("alert-lists", { gist: null, lists: [] }, true);
    store.set("metal-sheets", { gist: null, lists: [] }, true);
    store.set("vis", { gist: null, lists: [] }, true);
    store.set("vis-data", { gist: null, lists: [] }, true);

    store.set(
        "vis-bookmarks",
        {
            gist: null,
            lists: [
                {
                    title: "Presse 0",
                    allowDeletion: false,
                    data: [],
                },
                {
                    title: "Presse 2",
                    allowDeletion: false,
                    data: [],
                },
                {
                    title: "Presse 3",
                    allowDeletion: false,
                    data: [],
                },
                {
                    title: "Presse 4",
                    allowDeletion: false,
                    data: [],
                },
                {
                    title: "Presse 5",
                    allowDeletion: false,
                    data: [],
                },
            ],
        },
        true,
    );

    store.set("special", { gist: null, lists: [] }, true);

    store.set("runtime", { lists: {} }, false);

    return store;
}
