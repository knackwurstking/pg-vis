import FileSaver from "file-saver";
import JSZip from "jszip";
import { CleanUp, html, UIDrawerGroup } from "ui";
import { pages } from "../../data/constants";
import { utils } from "../../lib";

/**
 * @typedef {import("../pages/vis-data").VisDataPage} VisDataPage
 */

const title = "Vis Data";
const storeKey = "visData";

export class PGDrawerGroupVisData extends UIDrawerGroup {
  static register = () => {
    customElements.define("pg-drawer-group-vis-data", PGDrawerGroupVisData);
  };

  constructor() {
    super();

    this.cleanup = new CleanUp();

    /** @type {PGStore} */
    this.uiStore = document.querySelector("ui-store");

    /** @type {import("ui").UIStackLayout} */
    this.stackLayout = document.querySelector("ui-stack-layout");

    /**
     * @param {PGStore_VisData[]} lists
     */
    this.onVisData = (lists) => {
      if (!lists) throw `no data!`;
      while (this.children.length > 3) this.removeChild(this.lastChild);

      for (let list of utils.sort.visData(lists)) {
        list = utils.sort.visDataEntries(list);

        this.appendChild(
          utils.create.pgDrawerItem({
            primary: `${list.title}`,
            secondary: `${list.data.length} Einträge`,

            onClick: () => {
              this.stackLayout.ui.clear();
              this.stackLayout.ui.set(
                pages.visData,
                (/**@type {VisDataPage}*/ page) => {
                  page.set(list);
                },
              );
              /** @type {import("../pg-drawer").PGDrawer} */
              const pgDrawer = document.querySelector("pg-drawer");
              pgDrawer.ui.open = false;
            },

            onDelete: () => {
              this.uiStore.ui.update(storeKey, (data) => {
                return data.filter((item) => item.title !== list.title);
              });
            },
          }),
        );
      }
    };

    /**
     * @param {PGStore_VisData} data
     */
    this.onUpdate = (data) => {
      utils.store.update(this.uiStore, data, {
        storeDataKey: storeKey,
        getKey: utils.getVisDataKey,
      });
    };

    this.render();
  }

  render() {
    this.innerHTML = html`
      <pg-drawer-item-import
        storegistkey="${pages.visData}"
        title="${title}"
      ></pg-drawer-item-import>

      <pg-drawer-item-gist></pg-drawer-item-gist>
      <pg-drawer-item-new type="${storeKey}"></pg-drawer-item-new>
    `;

    /** @type {import("./pg-drawer-item-import").PGDrawerItemImport<PGStore_VisData>} */
    const importItem = this.querySelector(`pg-drawer-item-import`);

    importItem.pg.setValidateHandler(utils.validate.visData);
    importItem.pg.setUpdateHandler(this.onUpdate);

    importItem.pg.setBeforeUpdateHandler(() => {
      // Clear all existing data before
      this.uiStore.ui.set(storeKey, []);
    });

    importItem.pg.setExportHandler(async () => {
      const zip = new JSZip();
      for (const list of this.uiStore.ui.get(storeKey)) {
        const fileName = utils.getVisDataFileName(list);
        const data = JSON.stringify(list);
        zip.file(fileName, data);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      FileSaver.saveAs(blob, `${pages.visData}-${new Date().getTime()}.zip`);
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this.ui.title = title;
    this.cleanup.add(
      this.uiStore.ui.on("gist", (data) => {
        utils.store.gistHandler(
          this.querySelector("pg-drawer-item-gist"),
          data,
          {
            storeGistKey: pages.visData,
            storeDataKey: storeKey,
            getFileName: utils.getVisDataKey,
            onUpdate: this.onUpdate,
          },
        );
      }),

      this.uiStore.ui.on(storeKey, this.onVisData),
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanup.run();
  }
}
