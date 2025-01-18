import * as lib from "@lib";
import * as types from "@types";

export function productKey(product: types.Product): string {
    return `${product.lotto} ${product.name}`;
}

export function isFlakesProduct(store: types.PGStore, product: types.Product): boolean {
    const flakes = store.getData("special")?.find((data) => data.type === "flakes");
    return flakes?.products.find((lotto) => lotto === product.lotto) !== undefined;
}

export function listStore<T extends keyof lib.listStores.ListStoreData>(
    key: T,
): lib.listStores.ListStore<T> {
    switch (key) {
        case "alertLists":
            return new lib.listStores.AlertListsStore() as lib.listStores.ListStore<T>;

        case "metalSheets":
            return new lib.listStores.MetalSheetsStore() as lib.listStores.ListStore<T>;

        case "vis":
            return new lib.listStores.VisStore() as lib.listStores.ListStore<T>;

        case "visBookmarks":
            return new lib.listStores.VisBookmarksStore() as lib.listStores.ListStore<T>;

        case "visData":
            return new lib.listStores.VisDataStore() as lib.listStores.ListStore<T>;

        case "special":
            return new lib.listStores.SpecialStore() as lib.listStores.ListStore<T>;

        default:
            throw new Error(`unknown "${key}"`);
    }
}
