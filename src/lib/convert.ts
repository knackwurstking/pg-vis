import { Product, Vis } from "../store-types";

export function toVis(dataString: string): Vis | null {
    /** @type {PGStore_Vis} */
    const vis: Vis = (() => {
        const date = new Date();
        const m = (date.getMonth() + 1).toString().padStart(2, "0");
        const d = date.getDate().toString().padStart(2, "0");

        return {
            date: date.getTime(),
            title: `${date.getFullYear()}-${m}-${d}`,
            data: [],
        };
    })();

    for (let line of dataString.split("\n")) {
        line = line.trim();
        if (!line) continue;

        const product: Product = {
            lotto: "",
            name: "",
            format: "",
            stamp: "",
            thickness: -1,
        };

        const lineTabSplit = line.split("\t");

        product.lotto = lineTabSplit[0] || "";
        if (product.lotto === "") {
            throw new Error(`product lotto missing in ${line}`);
        }

        product.name = lineTabSplit[1] || "";
        if (product.name === "") {
            throw new Error(`product name not found in "${line}"`);
        }

        // TODO: Fix formats like: 120x60 & 60x120
        product.format = lineTabSplit[2] || "";
        if (product.format === "") {
            throw new Error(`product format not found in "${line}"`);
        }

        product.thickness = parseInt(lineTabSplit[3] || "-1", 10);
        if (product.thickness === -1) {
            throw new Error(`product thickness not found in "${line}"`);
        }

        product.stamp = lineTabSplit[4] || "";
        if (product.stamp === "") {
            throw new Error(`product stamp not found in "${line}"`);
        }

        vis.data.push(product);
    }

    return vis;
}
