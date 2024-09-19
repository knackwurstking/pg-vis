import { draggable, html, UIStackLayoutPage } from "ui";
import { pages } from "../../../data/constants";
import { utils } from "../../../lib";
import { CleanUp } from "ui";

const storeKey = "visLists";

export class VisListsPage extends UIStackLayoutPage {
  static register = () => {
    customElements.define("vis-lists-page", VisListsPage);
  };

  constructor() {
    super(pages.visLists);

    /** @type {PGStore} */
    this.uiStore = document.querySelector("ui-store");

    /** @type {import("ui").UIStackLayout} */
    this.stackLayout = document.querySelector("ui-stack-layout");

    this.cleanup = new CleanUp();

    /**
     * @private
     * @type {PGStore_VisList | null}
     */
    this.data = null;

    this.render();
  }

  render() {
    this.innerHTML = html`
      <div
        class="no-scrollbar container"
        style="
          position: relative;
          width: 100%;
          height: 100%;
          padding-top: calc(var(--ui-app-bar-height) + var(--pg-search-bar-height));
          overflow: auto;
          scroll-behavior: smooth;
        "
      >
        <ul class="list"></ul>
      </div>
    `;

    utils.events.addEventListener(
      this.querySelector("ul.list"),
      "click",
      `[data-vis-item]`,
      (_ev, target) => {
        this.stackLayout.ui.set(
          pages.product,
          (/** @type {import("../product").ProductPage} */ page) => {
            page.set(JSON.parse(target.getAttribute("data-json")));
          },
          true,
        );
      },
    );
  }

  connectedCallback() {
    super.connectedCallback();

    this.cleanup.add(
      this.uiStore.ui.on(storeKey, (lists) => {
        const key = utils.getVisListKey(this.data);
        const list = lists.find((list) => utils.getVisListKey(list) === key);
        if (!!list) this.set(list);
      }),
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanup.run();
  }

  /**
   * @param {PGStore_VisList} data
   */
  set(data) {
    this.data = data;

    this.uiStore.ui.set(
      "appBarTitle",
      !!this.data ? `Vis Listen - ${this.data.name}` : `Vis Listen`,
    );

    this.renderList();
  }

  /** @private */
  renderList() {
    /** @type {HTMLElement} */
    const list = this.querySelector("ul.list");

    while (!!list.firstChild) list.removeChild(list.firstChild);
    if (!this.data) return;

    for (const product of this.data.data) {
      list.appendChild(
        utils.create.visItem({
          product: product,
          hasRipple: true,
        }),
      );
    }

    draggable.createMobile(list, {
      onDragEnd: () => {
        this.data.data = [...list.children].map((child) => {
          return JSON.parse(child.getAttribute("data-json"));
        });

        this.uiStore.ui.update(storeKey, (lists) => {
          const key = utils.getVisListKey(this.data);
          lists = [
            ...lists.filter((l) => utils.getVisListKey(l) !== key),
            this.data,
          ];
          return lists;
        });
      },
    });
  }
}
