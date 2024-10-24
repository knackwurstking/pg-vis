import { html, UIStackLayoutPage } from "ui";
import { BookmarkDialog } from "../..";
import { pages } from "../../../data/constants";
import { utils } from "../../../lib";

export class ProductPage extends UIStackLayoutPage {
  static register = () => {
    customElements.define("product-page", ProductPage);
  };

  constructor() {
    super(pages.product);

    /** @type {PGStore} */
    this.uiStore = document.querySelector("ui-store");

    /** @type {import("../..").PGAppBar} */
    this.pgAppBar = document.querySelector("pg-app-bar");

    this.render();
  }

  shadowRender() {
    super.shadowRender();
    this.shadowRoot.innerHTML += html`
      <style>
        :host {
          display: block;
          padding-top: var(--ui-app-bar-height);
        }
      </style>
    `;
  }

  render() {
    this.innerHTML = html`
      <ui-flex-grid
        class="no-scrollbar"
        style="width: 100%; height: 100%; overflow: auto;"
        gap="0"
      >
        <ui-flex-grid-item flex="0">
          <span class="placeholder"></span>
        </ui-flex-grid-item>

        <ui-flex-grid-item>
          <ul class="list" style="margin: 0;"></ul>
        </ui-flex-grid-item>
      </ui-flex-grid>
    `;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.uiStore.ui.set("bookmark", { active: false });
  }

  /**
   * @param {Vis_Product} product
   */
  set(product) {
    const placeholder = this.querySelector(".placeholder");
    placeholder.parentElement.replaceChild(
      utils.create.visItem({ product, hasRipple: false }),
      placeholder,
    );

    // Set bookmark to active or not
    this.uiStore.ui.set("bookmark", { active: this.isBookmark(product) });

    this.pgAppBar.items.bookmark.ui.child.onclick = () => {
      const dialog = new BookmarkDialog();
      dialog.set(product);
      dialog.ui.events.on("close", () => {
        document.body.removeChild(dialog);
        this.uiStore.ui.set("bookmark", {
          active: this.isBookmark(product),
        });
      });
      document.body.appendChild(dialog);
      dialog.ui.open(true);
    };

    /** @type {HTMLUListElement} */
    const listElement = this.querySelector(".list");
    const lists = utils.sort.visData(this.uiStore.ui.get("visData"));

    let match = false;
    for (let list of lists) {
      match = false;
      list = utils.sort.visDataEntries(list);
      listElement.appendChild(this.createTitleItem(list.title));

      for (let i = 0; i < list.data.length; i++) {
        const entry = list.data[i];

        if (entry.lotto !== null) {
          if (!product.lotto.match(new RegExp(entry.lotto, "i"))) {
            continue;
          }
        }

        if (entry.format !== null) {
          if (!product.format.match(new RegExp(entry.format, "i"))) {
            continue;
          }
        }

        if (entry.stamp !== null) {
          if (!product.stamp.match(new RegExp(entry.stamp, "i"))) {
            continue;
          }
        }

        if (entry.thickness !== null) {
          if (
            !product.thickness
              .toString()
              .match(new RegExp(entry.thickness, "i"))
          ) {
            continue;
          }
        }

        match = true;
        listElement.appendChild(
          utils.create.visDataItem({
            index: i,
            entry: entry,
            events: null,
            hasRipple: false,
            disableFilters: true,
          }),
        );
      }

      if (!match) {
        listElement.removeChild(listElement.lastChild);
      }
    }
  }

  /**
   * @param {Vis_Product} product
   * @returns {boolean}
   */
  isBookmark(product) {
    const visLists = this.uiStore.ui.get("visLists");
    for (const list of visLists) {
      for (const p of list.data) {
        if (
          p.name === product.name &&
          p.lotto === product.lotto &&
          p.stamp === product.stamp &&
          p.format === product.format &&
          p.thickness === product.thickness
        ) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * @param {string} title
   * @returns {HTMLLIElement}
   */
  createTitleItem(title) {
    const item = document.createElement("li");
    item.style.textDecoration = "underline";
    item.style.textAlign = "center";
    item.innerHTML = html` <h3>${title}</h3> `;
    return item;
  }
}
