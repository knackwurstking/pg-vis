import * as lib from "@lib";
import * as types from "@types";

export function productKey(product: types.Product): string {
    return `${product.lotto} ${product.name}`;
}

export function isFlakesProduct(store: types.PGStore, product: types.Product): boolean {
    const flakes = store.getData("special")?.find((data) => data.type === "flakes");
    return flakes?.products.find((lotto) => lotto === product.lotto) !== undefined;
}
