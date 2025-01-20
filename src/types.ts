import * as ui from "ui";

export interface Alert {
    from: number;
    to: number;
    alert: string;
    desc: string[];
}

export interface AlertList {
    title: string;
    data: Alert[];
}

export interface Bookmarks {
    title: string;
    allowDeletion: boolean;
    data: Product[];
}

export type DrawerGroups =
    | "alert-lists"
    | "metal-sheets"
    | "vis"
    | "vis-bookmarks"
    | "vis-data"
    | "special";

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

export type PGStore = ui.Store<PGStoreEvents>;

// NOTE:
//  - Kicked: theme.name in v2.0.0
export interface PGStoreEvents {
    drawer: {
        open: boolean;
    };

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

        "vis-bookmarks"?: {
            open: boolean;
        };

        "vis-data"?: {
            open: boolean;
        };

        special?: {
            open: boolean;
        };
    };

    gist: {
        [key: string]: {
            id: string;
            revision: number;
        };
    };

    alertLists: AlertList[];
    metalSheets: MetalSheet[];
    special: Special[];
    vis: Vis[];
    visData: VisData[];
    visBookmarks: Bookmarks[];
}

export interface Product {
    lotto: string;
    name: string;
    format: string;
    thickness: number;
    stamp: string;
}

export type Special = SpecialFlakes;

export interface SpecialFlakes {
    type: "flakes";
    title: string;
    data: SpecialFlakesEntry[];
}

export interface SpecialFlakesEntry {
    press: SpecialFlakes_PressSlot;
    compatatore: number;
    primary: SpecialFlakes_Consumption;
    secondary: ({ slot: SpecialFlakes_TowerSlot } & SpecialFlakes_Consumption)[];
}

export interface SpecialFlakes_Consumption {
    percent: number;
    value: number;
}

export type SpecialFlakes_TowerSlot = "A" | "C" | "E" | "G" | "I" | "K";
export type SpecialFlakes_PressSlot = "P0" | "P4" | "P5";

export interface Vis {
    /**
     * Needed for vis bookmarks
     */
    date: number;
    title: string;
    data: Product[];
}

export interface VisData {
    title: string;
    data: VisDataEntry[];
}

export interface VisDataEntry {
    key: string | null;
    value: string;
    lotto: string | null;
    format: string | null;
    thickness: string | null;
    stamp: string | null;
}
