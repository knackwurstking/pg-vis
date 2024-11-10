import { Product } from "../store-types";
import {
    AlertListsStore,
    ListsStore,
    ListsStoreData,
    MetalSheetsStore,
    VisBookmarksStore,
    VisDataStore,
    VisStore,
} from "./lists-store";

export function productKey(product: Product): string {
    return `${product.lotto} ${product.name}`;
}

export function listsStore<T extends keyof ListsStoreData>(key: T): ListsStore<T> {
    switch (key) {
        case "alertLists":
            return new AlertListsStore() as ListsStore<T>;

        case "metalSheets":
            return new MetalSheetsStore() as ListsStore<T>;

        case "vis":
            return new VisStore() as ListsStore<T>;

        case "visBookmarks":
            return new VisBookmarksStore() as ListsStore<T>;

        case "visData":
            return new VisDataStore() as ListsStore<T>;

        default:
            throw new Error(`unknown "${key}"`);
    }
}
