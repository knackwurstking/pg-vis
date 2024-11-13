import * as types from "../../types";

import { ListStore, ListStoreData } from "./base";

export class VisBookmarksStore extends ListStore<"visBookmarks"> {
    public key(): keyof ListStoreData {
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
