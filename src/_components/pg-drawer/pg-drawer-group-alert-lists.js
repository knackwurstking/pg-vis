import { CleanUp, html, UIDrawerGroup } from "ui";
import { pages } from "../../data/constants";
import { utils } from "../../lib";

const title = "Alarm Listen";
const storeKey = "alertLists";

export class PGDrawerGroupAlertLists extends UIDrawerGroup {
  static register = () => {
    customElements.define(
      "pg-drawer-group-alert-lists",
      PGDrawerGroupAlertLists,
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
     * @param {PGStore_AlertList[]} lists
     */
    this.onAlertLists = (lists) => {
      if (!lists) throw `no data!`;
      while (this.children.length > 2) this.removeChild(this.lastChild);

      for (const list of utils.sort.alertLists(lists)) {
        this.appendChild(
          utils.create.pgDrawerItem({
            primary: list.title,
            secondary: null,

            onClick: () => {
              this.stackLayout.ui.clear();
              this.stackLayout.ui.set(
                pages.alertLists,
                (
                  /**
                   * @type {import("../pages/alert-lists").AlertListsPage}
                   */
                  page,
                ) => {
                  page.set(list);
                },
              );

              /** @type {import("../pg-drawer").PGDrawer} */
              const pgDrawer = document.querySelector("pg-drawer");
              pgDrawer.ui.open = false;
            },

            onDelete: () => {
              // Delete "${list.title} - ${list.date}"?
              if (confirm(`Löschen "${list.title}"?`)) {
                this.uiStore.ui.update(storeKey, (data) => {
                  return data.filter((item) => item.title !== list.title);
                });
              }
            },
          }),
        );
      }
    };

    /**
     * @param {PGStore_AlertList} data
     */
    this.onUpdate = (data) => {
      utils.store.update(this.uiStore, data, {
        storeDataKey: storeKey,
        getKey: utils.getAlertListKey,
      });
    };

    this.render();
  }

  render() {
    this.innerHTML = html`
      <pg-drawer-item-import
        storegistkey="${pages.alertLists}"
        title="${title}"
      ></pg-drawer-item-import>

      <pg-drawer-item-gist></pg-drawer-item-gist>
    `;

    this.style.position = "relative";

    /** @type {import("./pg-drawer-item-import").PGDrawerItemImport<PGStore_AlertList>} */
    const importItem = this.querySelector(`pg-drawer-item-import`);
    importItem.pg.setValidateHandler(utils.validate.alertList);
    importItem.pg.setUpdateHandler(this.onUpdate);

    importItem.pg.setBeforeUpdateHandler(async () => {
      this.uiStore.ui.set(storeKey, []); // wipe data
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
              storeGistKey: pages.alertLists,
              storeDataKey: storeKey,
              getFileName: utils.getAlertListFileName,
              onUpdate: this.onUpdate,
            },
          );
        },
        true,
      ),
      this.uiStore.ui.on(storeKey, this.onAlertLists),
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanup.run();
  }
}
