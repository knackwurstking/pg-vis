import * as lib from "@lib";
import * as types from "@types";

export class SpecialStore extends lib.listStores.ListStore<"special"> {
    public key(): keyof lib.listStores.ListStoreData {
        return "special";
    }

    public listKey(list: types.Special): string {
        return `${list.title}`;
    }

    public title(): string {
        return "Special";
    }

    public fileName(list: types.Special): string {
        return `Special - ${super.fileName(list)}`;
    }

    public validate(dataString: string): types.Special | null {
        const list = super.validate(dataString);
        if (typeof list !== "object") return null;

        // TODO: ...

        return null;
    }
}
