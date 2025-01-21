import * as lib from "@lib";
import * as types from "@types";

export class MetalSheets extends lib.listStores.ListStore<"metalSheets"> {
    public key(): keyof lib.listStores.ListStoreData {
        return "metalSheets";
    }

    public listKey(list: types.MetalSheet): string {
        return `${list.format} ${list.toolID}`;
    }

    public title(): string {
        return "Blech Listen";
    }

    public fileName(list: types.MetalSheet): string {
        return `Blech Liste - ${super.fileName(list)}`;
    }

    public validate(dataString: string): types.MetalSheet | null {
        const list = super.validate(dataString);
        if (typeof list !== "object") return null;

        if (typeof list.format !== "string") return null;

        if (!list.toolID) list.toolID = "";
        if (typeof list.toolID !== "string") return null;

        if (!("data" in list)) return null;

        if (typeof list.data !== "object") return null;
        if (typeof list.data.press !== "number") return null;

        if (!("table" in list.data)) {
            list.data.table = { header: [], data: [] };
        } else {
            if (typeof list.data.table !== "object") return null;

            if (!("header" in list.data.table)) return null;
            if (!("data" in list.data.table)) return null;

            if (!Array.isArray(list.data.table.header) || !Array.isArray(list.data.table.data)) {
                return null;
            }

            for (const s of list.data.table.header) {
                if (typeof s !== "string") return null;
            }

            for (const part of list.data.table.data) {
                for (const s of part) {
                    if (typeof s !== "string") return null;
                }
            }
        }

        return list;
    }

    public sort(data: types.MetalSheet[]): types.MetalSheet[] {
        const keyOf = (list: types.MetalSheet): string => {
            return list.data.press > -1
                ? `[P${list.data.press}] ${this.listKey(list)}`
                : `${this.listKey(list)}`;
        };

        const activeKeys: string[] = [...data.filter((list) => list.data.press >= 0)]
            .map((list) => keyOf(list))
            .sort();

        const inactiveKeys: string[] = [...data.filter((list) => list.data.press < 0)]
            .map((list) => keyOf(list))
            .sort();

        const result: types.MetalSheet[] = [];
        for (const key of [...activeKeys, ...inactiveKeys]) {
            const keyData = data.find((list) => keyOf(list) === key);
            if (keyData !== undefined) result.push(keyData);
        }

        return result;
    }
}
