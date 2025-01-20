import * as ui from "ui";

import * as types from "./types";

export const version = "v2.0.0";
export const build = 15; // NOTE: v2.0.0 build
export const store = createStore();

function createStore(): types.PGStore {
    const storePrefix = "pg-vis-dev:";
    const store: types.PGStore = new ui.Store(storePrefix);

    // TODO: Initialize here... (Set defaults)
    store.set("drawer", { open: true }, false);
    store.set("drawerGroup", {}, true);

    return store;
}
