import FileSaver from "file-saver";
import JSZip from "jszip";
import { CleanUp, html, UIDrawerGroup } from "ui";
import { pages } from "../../data/constants";
import { utils } from "../../lib";

const title = "Blech Listen";
const storeKey = "metalSheetLists";

export class PGDrawerGroupMetalSheetLists extends UIDrawerGroup {
  static register = () => {
    customElements.define(
      "pg-drawer-group-metal-sheet-lists",
      PGDrawerGroupMetalSheetLists,
    );
  };

  constructor() {
    super();

    this.cleanup = new CleanUp();

    /** @type {PGStore} */
    this.uiStore = document.querySelector("ui-store");

    /** @type {import("ui").UIStackLayout} */
    this.stackLayout = document.querySelector("ui-stack-layout");

    /**
     * @param {PGStore_MetalSheetList[]} lists
     */
    this.onMetalSheetList = (lists) => {
      if (!lists) throw `no data!`;
      while (this.children.length > 3) this.removeChild(this.lastChild);

      for (const list of utils.sort.metalSheetLists(lists)) {
        this.appendChild(
          utils.create.pgDrawerItem({
            primary: `
              ${list.format}
              <span style="font-size: 0.85rem;">
                ${list.data.press > -1 ? "[P" + list.data.press + "]" : ""}
              </span>
            `,
            secondary: `${list.toolID}`,

            onClick: () => {
              this.stackLayout.ui.clear();
              this.stackLayout.ui.set(
                pages.metalSheetLists,
                (
                  /** @type {import("../pages/metal-sheet-lists/metal-sheet-lists-page").MetalSheetListsPage} */ page,
                ) => {
                  page.set(list);
                },
              );

              /** @type {import("../pg-drawer").PGDrawer} */
              const pgDrawer = document.querySelector("pg-drawer");
              pgDrawer.ui.open = false;
            },

            onDelete: () => {
              // Delete "${list.format} - ${list.toolID} - ${list.date}"?
              if (confirm(`Löschen "${list.format} - ${list.toolID}"?`)) {
                this.uiStore.ui.update(storeKey, (data) => {
                  const key = utils.getMetalSheetKey(list);
                  return data.filter(
                    (item) => utils.getMetalSheetKey(item) !== key,
                  );
                });
              }
            },
          }),
        );
      }
    };

    /**
     * @param {PGStore_MetalSheetList} data
     */
    this.onUpdate = (data) => {
      utils.store.update(this.uiStore, data, {
        storeDataKey: storeKey,
        getKey: utils.getMetalSheetKey,
      });
    };

    this.render();
  }

  render() {
    this.innerHTML = html`
      <pg-drawer-item-import
        storegistkey="${pages.metalSheetLists}"
        title="${title}"
      ></pg-drawer-item-import>

      <pg-drawer-item-gist></pg-drawer-item-gist>
      <pg-drawer-item-new type="${storeKey}"></pg-drawer-item-new>
    `;

    this.style.position = "relative";

    /** @type {import("./pg-drawer-item-import").PGDrawerItemImport<PGStore_MetalSheetList>} */
    const importItem = this.querySelector(`pg-drawer-item-import`);
    importItem.pg.setValidateHandler(utils.validate.metalSheetList);
    importItem.pg.setUpdateHandler(this.onUpdate);

    importItem.pg.setBeforeUpdateHandler(async () => {
      this.uiStore.ui.set(storeKey, []); // wipe data
    });

    importItem.pg.setExportHandler(async () => {
      const zip = new JSZip();
      for (const list of this.uiStore.ui.get(storeKey)) {
        const fileName = utils.getMetalSheetFileName(list);
        const data = JSON.stringify(list);
        zip.file(fileName, data);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      FileSaver.saveAs(
        blob,
        `${pages.metalSheetLists}-${new Date().getTime()}.zip`,
      );
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
              storeGistKey: pages.metalSheetLists,
              storeDataKey: storeKey,
              getFileName: utils.getMetalSheetFileName,
              onUpdate: this.onUpdate,
            },
          );
        },
        true,
      ),

      this.uiStore.ui.on(storeKey, this.onMetalSheetList),
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanup.run();
  }
}
