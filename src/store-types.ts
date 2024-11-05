import { UIStore, UIThemeHandlerTheme } from "ui";

export type PGStore = UIStore<PGStoreEvents>;

export type PGStackLayoutPage =
    | "alertLists"
    | "metalSheets"
    | "vis"
    | "product"
    | "visBookmarks"
    | "visData"
    | "alert";

export interface PGStoreEvents {
    theme: {
        name: UIThemeHandlerTheme;
    };

    drawer: { open: boolean };
    drawerGroup: {
        "alert-lists"?: {
            open: boolean;
        };
        "metal-sheets"?: {
            open: boolean;
        };
        vis?: {
            open: boolean;
        };
    };

    alertLists: AlertList[];
    metalSheets: MetalSheet[];
    vis: Vis[];

    // TODO: Store Keys for "vis-bookmarks"
    visBookmarks: [];
    // TODO: Store Keys for "vis-data"
    visData: [];

    gist: {
        [key: string]: {
            id: string;
            revision: number;
        };
    };

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

export interface AlertList {
    title: string;
    data: Alert[];
}

export interface Alert {
    from: number;
    to: number;
    alert: string;
    desc: string[];
}

export interface MetalSheet {
    format: string;
    toolID: string;
    data: {
        /**
         * Use `-1` for none
         */
        press: number;
        table: {
            header: string[];
            data: string[][];
        };
    };
}

export interface Vis {
    title: string;
    data: Product[];
}

export interface Product {
    lotto: string;
    name: string;
    format: string;
    thickness: number;
    stamp: string;
}
