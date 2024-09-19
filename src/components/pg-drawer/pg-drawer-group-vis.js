import FileSaver from "file-saver";
import JSZip from "jszip";
import { CleanUp, html, UIDrawerGroup } from "ui";
import { pages } from "../../data/constants";
import { utils } from "../../lib";

/**
 * @typedef {import("./pg-drawer-item-import").PGDrawerItemImport<PGStore_Vis>} PGDrawerVisItemImport
 * @typedef {import("ui").UIStackLayout} UIStackLayout
 * @typedef {import("../pg-drawer").PGDrawer} PGDrawer
 * @typedef {import("../pages/vis").VisPage} VisPage
 */

const title = "Vis";
const storeKey = "vis";

export class PGDrawerGroupVis extends UIDrawerGroup {
  static register = () => {
    customElements.define("pg-drawer-group-vis", PGDrawerGroupVis);
  };

  constructor() {
    super();

    /** @type {PGStore} */
    this.uiStore = document.querySelector("ui-store");

    /** @type {UIStackLayout} */
    this.stackLayout = document.querySelector("ui-stack-layout");

    this.cleanup = new CleanUp();

    /**
     * @param {PGStore_Vis[]} lists
     */
    this.onVis = (lists) => {
      if (!lists) throw `no data!`;
      while (this.children.length > 2) this.removeChild(this.lastChild);

      for (const list of lists) {
        this.appendChild(
          utils.create.pgDrawerItem({
            primary: `${list.title}`,
            secondary: `${list.data.length} Einträge`,

            onClick: () => {
              this.stackLayout.ui.clear();
              this.stackLayout.ui.set(
                pages.vis,
                (
                  /**
                   * @type {VisPage}
                   */
                  page,
                ) => {
                  page.set(list);
                },
              );

              /** @type {PGDrawer} */
              const pgDrawer = document.querySelector("pg-drawer");
              pgDrawer.ui.open = false;
            },

            onDelete: () => {
              this.uiStore.ui.update(storeKey, (data) => {
                const key = utils.getVisKey(list);
                return data.filter((item) => utils.getVisKey(item) !== key);
              });
            },
          }),
        );
      }
    };

    /**
     * @param {PGStore_Vis} data
     */
    this.onUpdate = (data) => {
      utils.store.update(this.uiStore, data, {
        storeDataKey: storeKey,
        getKey: utils.getVisKey,
      });
    };

    this.render();
  }

  render() {
    this.innerHTML = html`
      <pg-drawer-item-import
        storegistkey="${pages.vis}"
        title="${title}"
      ></pg-drawer-item-import>

      <pg-drawer-item-gist></pg-drawer-item-gist>
    `;

    /** @type {PGDrawerVisItemImport} */
    const importItem = this.querySelector(`pg-drawer-item-import`);

    importItem.pg.setValidateHandler(utils.validate.vis);
    importItem.pg.setUpdateHandler(this.onUpdate);

    importItem.pg.setBeforeUpdateHandler(() => {
      // Clear all existing data before
      this.uiStore.ui.set(storeKey, []);
    });

    importItem.pg.setExportHandler(async () => {
      const zip = new JSZip();
      for (const list of this.uiStore.ui.get(storeKey)) {
        const fileName = utils.getVisFileName(list);
        const data = JSON.stringify(list);
        zip.file(fileName, data);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      FileSaver.saveAs(blob, `${pages.vis}-${new Date().getTime()}.zip`);
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this.ui.title = title;

    this.cleanup.add(
      this.uiStore.ui.on(
        "gist",
        (data) => {
          utils.store.gistHandler(
            this.querySelector("pg-drawer-item-gist"),
            data,
            {
              storeGistKey: pages.vis,
              storeDataKey: storeKey,
              getFileName: utils.getVisFileName,
              onUpdate: this.onUpdate,
            },
          );
        },
        true,
      ),

      this.uiStore.ui.on(storeKey, this.onVis),
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanup.run();
  }
}
