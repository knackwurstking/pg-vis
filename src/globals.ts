import * as ui from "ui";

import * as types from "./types";

export const store = createStore();

function createStore(): types.PGStore {
    const storePrefix = "pg-vis-dev:";
    const store: types.PGStore = new ui.Store(storePrefix);

    // TODO: Initialize here... (Set defaults)
    store.set("drawerGroup", {}, true);

    store.set("alert-lists", { gist: null, lists: [] }, true);
    store.set("metal-sheets", { gist: null, lists: [] }, true);
    store.set("vis", { gist: null, lists: [] }, true);
    store.set("vis-bookmarks", { gist: null, lists: [] }, true);
    store.set("special", { gist: null, lists: [] }, true);

    return store;
}
