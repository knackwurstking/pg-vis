type PGStore = import("ui").UIStore<PGStore_Events>;

interface PGStore_Events {
  alertLists: PGStore_AlertList[];
  metalSheetLists: PGStore_MetalSheetList[];
  vis: PGStore_Vis[];
  visLists: PGStore_VisList[];
  visData: PGStore_VisData[];
  gist: PGStore_Gist;
  appBarTitle: string;
  edit: PGStore_Edit | null;
  share: (() => ShareData) | null;
  search: PGStore_Search;
  bookmark: PGStore_Bookmark;
}

interface PGStore_AlertList {
  title: string;
  data: AlertList_Alert[];
}

interface AlertList_Alert {
  from: number;
  to: number;
  alert: string;
  desc: string[];
}

interface PGStore_MetalSheetList {
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

interface PGStore_Vis {
  date: number;
  title: string;
  data: Vis_Product[];
}

interface Vis_Product {
  lotto: string;
  name: string;
  format: string;
  thickness: number;
  stamp: string;
}

interface PGStore_VisList {
  name: string;
  allowDeletion: boolean;
  data: Vis_Product[];
}

interface PGStore_VisData {
  title: string;
  data: VisData_Entry[];
}

interface VisData_Entry {
  key: string;
  value: string;
  lotto: null | string;
  format: null | string;
  thickness: null | string;
  stamp: null | string;
}

interface PGStore_Gist {
  [key: string]: {
    id: string;
    revision: number;
  };
}

interface PGStore_Edit {
  onClick: () => void | Promise<void>;
}

interface PGStore_Search {
  active: boolean;
}

interface PGStore_Bookmark {
  active: boolean;
}
