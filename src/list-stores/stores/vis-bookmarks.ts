import * as lib from "@lib";
import * as types from "@types";

export class VISBookmarks extends lib.listStores.ListStore<"visBookmarks"> {
    public key(): keyof lib.listStores.ListStoreData {
        return "visBookmarks";
    }

    public listKey(list: types.Bookmarks): string {
        return `${list.title}`;
    }

    public title(): string {
        return "Vis Bookmarks";
    }

    public fileName(list: types.Bookmarks): string {
        return `Vis Bookmarks - ${super.fileName(list)}`;
    }
}
