import * as ui from "ui";

import * as listsStore from "./list-stores";
import * as types from "./types";

export const store = createStore();

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

    return list.data[index];
}

function createStore(): types.PGStore {
    console.debug("create store");
    const storePrefix = "pg-vis-dev:";
    const store: types.PGStore = new ui.Store(storePrefix);

    store.set("drawerGroup", {}, true);

    store.set("alert-lists", { gist: null, lists: [] }, true);
    store.set("metal-sheets", { gist: null, lists: [] }, true);
    store.set("vis", { gist: null, lists: [] }, true);
    store.set("vis-data", { gist: null, lists: [] }, true);
    store.set("vis-bookmarks", { gist: null, lists: [] }, true);
    store.set("special", { gist: null, lists: [] }, true);

    store.set("runtime", { lists: {} }, false);

    return store;
}
