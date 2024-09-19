import { html, styles, UISpinner, UIStackLayoutPage } from "ui";
import { pages } from "../../../data/constants";
import { utils } from "../../../lib";

export class VisPage extends UIStackLayoutPage {
  static register = () => {
    customElements.define("vis-page", VisPage);
  };

  constructor() {
    super(pages.vis);

    /** @type {PGStore} */
    this.uiStore = document.querySelector("ui-store");
    /** @type {import("ui").UIStackLayout} */
    this.stackLayout = document.querySelector("ui-stack-layout");

    /** @type {PGStore_Vis | null} */
    this.list = null;

    this.render();
  }

  render() {
    this.innerHTML = html`
      <pg-search-bar title="Suche... (RegEx Mode)" active></pg-search-bar>

      <div
        class="no-scrollbar container"
        style="${styles(
          "position: relative",
          "width: 100%",
          "height: 100%",
          "padding-top: calc(var(--ui-app-bar-height) + var(--pg-search-bar-height))",
          "overflow: auto",
          "scroll-behavior: smooth",
        )}"
      >
        <ul class="list"></ul>
      </div>
    `;

    /** @type {import("../../pg-search-bar").PGSearchBar | null} */
    this.searchBar = this.querySelector("pg-search-bar");

    /** @type {NodeJS.Timeout | null} */
    let timeout = null;

    this.searchBar.pg.input().ui.events.on("input", async (value) => {
      if (timeout !== null) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(async () => {
        await this.search(value);
      }, 250);
    });

    // Update list after pg-search-bar has loaded the storage
    this.searchBar.pg.input().ui.events.on("storage", async (value) => {
      this.update(this.getRegExp(value));
    });

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
    this.setAppBarTitle();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  /** @param {PGStore_Vis} list */
  set(list) {
    this.list = list;
    this.setAppBarTitle();

    if (list === null) {
      this.searchBar.pg.input().ui.storagekey = null;
      return;
    }

    // Render list
    this.searchBar.pg.input().ui.storagekey = utils.getVisKey(list);
  }

  /**
   * @param {RegExp | null} [regex]
   */
  async update(regex = null) {
    const spinner = new UISpinner();
    spinner.ui.nobg = true;

    const container = this.querySelector(".container");
    container.appendChild(spinner);

    const list = this.querySelector(".list");
    while (!!list.firstChild) list.removeChild(list.firstChild);

    if (!this.list) return;

    for (let x = 0; x < this.list.data.length; x++) {
      ((index) => {
        setTimeout(() => {
          const item = utils.create.visItem({ product: this.list.data[index] });
          this.checkItem(item, regex);

          if (
            index >= this.list.data.length - 1 ||
            item.style.display !== "none"
          ) {
            if (!!spinner.parentElement) container.removeChild(spinner);
          }

          list.appendChild(item);
        }, 1);
      })(x);
    }
  }

  /** @param {string} value */
  async search(value) {
    const regex = this.getRegExp(value);
    const list = this.querySelector(".list");

    for (const child of [...list.children]) {
      this.checkItem(child, regex);
    }
  }

  /**
   * @private
   * @param {string} value
   */
  getRegExp(value) {
    return new RegExp(value.replaceAll(" ", ".*"), "i");
  }

  /**
   * @private
   * @param {Element} item
   * @param {RegExp} regex
   * @returns {Element}
   */
  checkItem(item, regex) {
    if (!regex) {
      // @ts-expect-error
      item.style.display = "block";
    } else if (!!item.getAttribute("data-value").match(regex)) {
      // @ts-expect-error
      item.style.display = "block";
    } else {
      // @ts-expect-error
      item.style.display = "none";
    }

    return item;
  }

  /** @private */
  setAppBarTitle() {
    this.uiStore.ui.set(
      "appBarTitle",
      !!this.list ? `Vis - ${this.list.title}` : `Vis`,
    );
  }
}
