import * as ui from "ui";

import * as listsStore from "./list-stores";
import * as types from "./types";

export const store = createStore();

export const router = {
    goTo(query: { [key: string]: string } | null, hash: string): void {
        let search: string;
        if (!query) {
            search = "";
        } else {
            search = `?${Object.entries(query)
                .map((e) => e.join("="))
                .join("&")}`;
        }

        location.hash = `${hash}${search}`;
    },
};

export function getAlertList(listKey: string): types.AlertList | null {
    const ls = listsStore.get("alert-lists");

    const list = store.get("alert-lists")!.lists.find((list) => {
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
