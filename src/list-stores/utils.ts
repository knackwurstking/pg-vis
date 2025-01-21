import * as base from "./base";

import { AlertListsStore } from "./alert-lists-store";
import { MetalSheetsStore } from "./metal-sheets-store";
import { SpecialStore } from "./special-store";
import { VisBookmarksStore } from "./vis-bookmarks-store";
import { VisDataStore } from "./vis-data-store";
import { VisStore } from "./vis-store";

export function get<T extends keyof base.ListStoreData>(key: T): base.ListStore<T> {
    switch (key) {
        case "alert-lists":
            return new AlertListsStore() as base.ListStore<T>;

        case "metal-sheets":
            return new MetalSheetsStore() as base.ListStore<T>;

        case "vis":
            return new VisStore() as base.ListStore<T>;

        case "vis-bookmarks":
            return new VisBookmarksStore() as base.ListStore<T>;

        case "vis-data":
            return new VisDataStore() as base.ListStore<T>;

        case "special":
            return new SpecialStore() as base.ListStore<T>;

        default:
            throw new Error(`unknown "${key}"`);
    }
}
