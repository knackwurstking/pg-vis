import * as types from "../types";
import * as listStores from "./list-stores";

export function productKey(product: types.Product): string {
    return `${product.lotto} ${product.name}`;
}

export function listStore<T extends keyof listStores.ListStoreData>(
    key: T,
): listStores.ListStore<T> {
    switch (key) {
        case "alertLists":
            return new listStores.AlertListsStore() as listStores.ListStore<T>;

        case "metalSheets":
            return new listStores.MetalSheetsStore() as listStores.ListStore<T>;

        case "vis":
            return new listStores.VisStore() as listStores.ListStore<T>;

        case "visBookmarks":
            return new listStores.VisBookmarksStore() as listStores.ListStore<T>;

        case "visData":
            return new listStores.VisDataStore() as listStores.ListStore<T>;

        default:
            throw new Error(`unknown "${key}"`);
    }
}
