import { html, styles, UIDrawer } from "ui";
import { build, version } from "../../data/version";
import { utils } from "../../lib";
import { PGDrawerGroupAlertLists } from "./pg-drawer-group-alert-lists";
import { PGDrawerGroupMetalSheetLists } from "./pg-drawer-group-metal-sheet-lists";
import { PGDrawerGroupVis } from "./pg-drawer-group-vis";
import { PGDrawerGroupVisData } from "./pg-drawer-group-vis-data";
import { PGDrawerGroupVisLists } from "./pg-drawer-group-vis-lists";
import { PGDrawerItemGist } from "./pg-drawer-item-gist";
import { PGDrawerItemImport } from "./pg-drawer-item-import";
import { PGDrawerItemNew } from "./pg-drawer-item-new";
import { PGDrawerRevision } from "./pg-drawer-revision";

/**
 * @typedef {{
 *  "alert-lists": import("./pg-drawer-group-alert-lists").PGDrawerGroupAlertLists;
 *  "metal-sheet-lists": import("./pg-drawer-group-metal-sheet-lists").PGDrawerGroupMetalSheetLists;
 *  "vis": import("./pg-drawer-group-vis").PGDrawerGroupVis;
 *  "vis-data": import("./pg-drawer-group-vis-data").PGDrawerGroupVisData;
 * }} PGDrawerGroups
 */

export class PGDrawer extends UIDrawer {
    static register = () => {
        // Groups
        PGDrawerGroupAlertLists.register();
        PGDrawerGroupMetalSheetLists.register();
        PGDrawerGroupVisData.register();
        PGDrawerGroupVisLists.register();
        PGDrawerGroupVis.register();

        // Items
        PGDrawerItemGist.register();
        PGDrawerItemImport.register();
        PGDrawerItemNew.register();

        // Components
        PGDrawerRevision.register();

        customElements.define("pg-drawer", PGDrawer);
    };

    constructor() {
        super();
        this.render();
    }

    render() {
        this.innerHTML = html`
            <pg-drawer-group-alert-lists fold></pg-drawer-group-alert-lists>

            <pg-drawer-group-metal-sheet-lists fold>
            </pg-drawer-group-metal-sheet-lists>

            <pg-drawer-group-vis fold></pg-drawer-group-vis>

            <pg-drawer-group-vis-lists fold></pg-drawer-group-vis-lists>

            <pg-drawer-group-vis-data fold></pg-drawer-group-vis-data>
        `;
    }
}
