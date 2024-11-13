import * as types from "../../types";

import { ListsStore, ListsStoreData } from "./base";

export class VisBookmarksStore extends ListsStore<"visBookmarks"> {
    public key(): keyof ListsStoreData {
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
