import { CleanUp, html, UIDrawerGroup } from "ui";
import { pages } from "../../data/constants";
import { utils } from "../../lib";

/**
 * @typedef {import("../pages/vis-lists").VisListsPage} VisListsPage
 * @typedef {import("../pg-drawer").PGDrawer} PGDrawer
 * @typedef {import("./pg-drawer-item-import").PGDrawerItemImport<PGStore_VisList>} PGDrawerItemVisListImport
 * @typedef {import("ui").UIStackLayout} UIStackLayout
 */

const title = "Vis Listen";
const storeKey = "visLists";

export class PGDrawerGroupVisLists extends UIDrawerGroup {
  static register = () => {
    customElements.define("pg-drawer-group-vis-lists", PGDrawerGroupVisLists);
  };

  constructor() {
    super();

    /** @type {PGStore} */
    this.uiStore = document.querySelector("ui-store");

    /** @type {UIStackLayout} */
    this.stackLayout = document.querySelector("ui-stack-layout");

    this.cleanup = new CleanUp();

    /**
     * @param {PGStore_VisList[]} lists
     */
    this.onVisLists = (lists) => {
      if (!lists) throw `no data!`;

      while (this.children.length > 0) this.removeChild(this.lastChild);

      for (const list of utils.sort.visLists(lists)) {
        this.appendChild(
          utils.create.pgDrawerItem({
            primary: list.name,
            secondary: `${list.data.length} Einträge`,
            onClick: () => {
              this.stackLayout.ui.clear();
              this.stackLayout.ui.set(
                pages.visLists,
                (/** @type {VisListsPage} */ page) => {
                  page.set(list);
                },
              );

              /** @type {PGDrawer} */
              const pgDrawer = document.querySelector("pg-drawer");
              pgDrawer.ui.open = false;
            },
            onDelete: list.allowDeletion
              ? () => {
                  this.uiStore.ui.update(storeKey, (data) => {
                    const key = utils.getVisListKey(list);
                    return data.filter(
                      (item) => utils.getVisListKey(item) !== key,
                    );
                  });
                }
              : null,
          }),
        );
      }
    };

    /**
     * @param {PGStore_VisList} data
     */
    this.onUpdate = (data) => {
      utils.store.update(this.uiStore, data, {
        storeDataKey: storeKey,
        getKey: utils.getVisListKey,
      });
    };

    this.render();
  }

  render() {
    this.innerHTML = html``;
  }

  connectedCallback() {
    super.connectedCallback();
    this.ui.title = title;
    this.cleanup.add(this.uiStore.ui.on(storeKey, this.onVisLists));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanup.run();
  }
}
