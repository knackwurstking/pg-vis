import { UIStore } from "ui";

export type PGStore = UIStore<PGStoreEvents>;

export interface PGStoreEvents {
    alertLists: AlertList[];
    // TODO: Store Keys for "metal-sheets"
    // TODO: Store Keys for "vis"
    // TODO: Store Keys for "vis-bookmarks"
    // TODO: Store Keys for "vis-data"

    // NOTE: This was the old store
    //alertLists: PGStore_AlertList[];
    //metalSheetLists: PGStore_MetalSheetList[];
    //vis: PGStore_Vis[];
    //visLists: PGStore_VisList[];
    //visData: PGStore_VisData[];
    //gist: PGStore_Gist;
    //appBarTitle: string;
    //edit: PGStore_Edit | null;
    //share: (() => ShareData) | null;
    //search: PGStore_Search;
    //bookmark: PGStore_Bookmark;
}

interface AlertList {
    title: string;
    data: Alert[];
}

interface Alert {
    from: number;
    to: number;
    alert: string;
    desc: string[];
}
