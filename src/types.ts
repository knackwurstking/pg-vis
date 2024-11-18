/// <reference types="vite-plugin-pwa/client" />

import { UIAppBar, UIStore, UIThemeHandlerTheme } from "ui";

export type PGStore = UIStore<PGStoreEvents>;
export type PGAppBar = UIAppBar<
    "menu" | "back" | "title" | "edit" | "share" | "search" | "trash" | "printer"
>;

export type PGStackLayoutPage =
    | "alertLists"
    | "alert"
    | "metalSheets"
    | "vis"
    | "product"
    | "visBookmarks"
    | "visData"
    | "visDataEdit"
    | "special";

export type Special = FlakesSpecial;

export type TowerSlot = "A" | "C" | "E" | "G" | "I" | "K";
export type PressSlot = "P0" | "P4" | "P5";

export interface PGStoreEvents {
    theme: {
        name: UIThemeHandlerTheme;
    };

    drawer: { open: boolean };
    drawerGroup: {
        alertLists?: {
            open: boolean;
        };
        metalSheets?: {
            open: boolean;
        };
        vis?: {
            open: boolean;
        };
        visBookmarks?: {
            open: boolean;
        };
        visData?: {
            open: boolean;
        };
        special?: {
            open: boolean;
        };
    };

    alertLists: AlertList[];
    metalSheets: MetalSheet[];
    vis: Vis[];
    visData: VisData[];
    visBookmarks: Bookmarks[];

    special: Special[];

    gist: {
        [key: string]: {
            id: string;
            revision: number;
        };
    };
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
    /**
     * Needed for vis bookmarks
     */
    date: number;
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

export interface Bookmarks {
    title: string;
    allowDeletion: boolean;
    data: Product[];
}

export interface FlakesSpecial {
    type: "flakes";
    title: string;
    data: FlakesEntry[];
}

export interface FlakesEntry {
    press: PressSlot;
    compatatore: number;
    primary: Consumption;
    secondary: ({ slot: TowerSlot } & Consumption)[];
}

export interface Consumption {
    percent: number;
    value: number;
}

export interface FlakesFilter {
    c1: number | null;
    main: number | null;
    towerSlots: (number | null)[];
}
