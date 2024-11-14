import * as lib from "@lib";
import * as types from "@types";

export class VisStore extends lib.listStores.ListStore<"vis"> {
    public key(): keyof lib.listStores.ListStoreData {
        return "vis";
    }

    public listKey(list: types.Vis): string {
        return `${list.title}`;
    }

    public title(): string {
        return "Vis";
    }

    public fileName(list: types.Vis): string {
        return `Vis Liste - ${super.fileName(list)}`;
    }

    public validate(dataString: string): types.Vis | null {
        let list = super.validate(dataString);
        if (list === null) return lib.toVis(dataString);
        if (typeof list !== "object") return null;

        if (typeof list.date !== "number" || list.date <= 0) {
            list.date = new Date().getTime();
        }

        if (typeof list.title !== "string" || !Array.isArray(list.data)) return null;

        for (const product of list.data) {
            if (typeof product !== "object") return null;
            if (
                !("lotto" in product) ||
                !("name" in product) ||
                !("format" in product) ||
                !("thickness" in product) ||
                !("stamp" in product)
            ) {
                return null;
            }
        }

        return list;
    }
}
