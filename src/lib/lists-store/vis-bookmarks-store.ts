import { Bookmarks } from "../../store-types";
import { ListsStore, ListsStoreData } from "./base";

export class VisBookmarksStore extends ListsStore<"visBookmarks"> {
    public key(): keyof ListsStoreData {
        return "visBookmarks";
    }

    public listKey(list: Bookmarks): string {
        return `${list.title}`;
    }

    public title(): string {
        return "Vis Bookmarks";
    }

    public fileName(list: Bookmarks): string {
        return `Vis Bookmarks - ${super.fileName(list)}`;
    }
}
