import { CleanUp, html, styles, UIStackLayoutPage } from "ui";
import { pages } from "../../../data/constants";
import { utils } from "../../../lib";

export class AlertListsPage extends UIStackLayoutPage {
  static register = () => {
    customElements.define("alert-lists-page", AlertListsPage);
  };

  constructor() {
    super(pages.alertLists);

    this.cleanup = new CleanUp();

    /** @type {PGStore} */
    this.uiStore = document.querySelector("ui-store");

    /** @type {import("ui").UIStackLayout} */
    this.stackLayout = document.querySelector("ui-stack-layout");

    /** @type {PGStore_AlertList | null} */
    this.list = null;

    this.render();
  }

  render() {
    this.innerHTML = html`
      <pg-search-bar title="Alarmsuche (RegEx Mode)"></pg-search-bar>

      <div
        class="no-scrollbar"
        style="${styles(
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

    /** @type {import("../../pg-search-bar").PGSearchBar} */
    this.searchBar = this.querySelector("pg-search-bar");

    utils.events.addEventListener(
      this.querySelector("ul.list"),
      "click",
      `[data-alert-item]`,
      (_ev, target) => {
        this.stackLayout.ui.set(
          pages.alert,
          (/** @type {import("../alert").AlertPage} */ page) => {
            page.set(JSON.parse(target.getAttribute("data-json")));
          },
          true,
        );
      },
    );
  }

  connectedCallback() {
    super.connectedCallback();

    // Show or Hide the SearchBar on uiStore change

    this.cleanup.add(
      this.uiStore.ui.on("search", async ({ active }) => {
        this.searchBar.pg.active = active;
        await this.search(active ? this.searchBar.pg.input().ui.value : "");
      }),
    );

    // Bind SearchBar input event and filter alert list

    /**
     * @type {NodeJS.Timeout | null}
     */
    let timeout = null;
    this.cleanup.add(
      this.searchBar.pg.input().ui.events.on("input", async (value) => {
        if (timeout !== null) {
          clearTimeout(timeout);
        }

        timeout = setTimeout(async () => {
          await this.search(value);
        }, 250);
      }),
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stackLayout.ui.unregister(pages.alert);
    this.cleanup.run();
  }

  /** @param {PGStore_AlertList} list */
  set(list) {
    const title = list?.title || "";

    this.list = list || null;
    this.uiStore.ui.set("appBarTitle", title);
    this.searchBar.pg.input().ui.storagekey = utils.getAlertListKey(this.list);

    this.renderList();
  }

  /** @param {string} value */
  async search(value) {
    const regex = new RegExp(value.replaceAll(" ", ".*"), "i");
    [...this.querySelector("ul").children].forEach(
      (/** @type {HTMLLIElement} */ child) => {
        if (!this.searchBar.pg.active) {
          child.style.display = "flex";
          return;
        }

        if (this.is(JSON.parse(child.getAttribute("data-json")), regex)) {
          child.style.display = "flex";
          return;
        }

        child.style.display = "none";
      },
    );
  }

  /** @private */
  async renderList() {
    const ul = this.querySelector("ul");

    while (ul.children.length > 0) {
      ul.removeChild(ul.firstChild);
    }

    const search = this.uiStore.ui.get("search");
    const regex = new RegExp(
      this.searchBar.pg.input().ui.value.replaceAll(" ", ".*"),
    );

    for (let x = 0; x < this.list.data.length; x++) {
      ((index) => {
        setTimeout(() => {
          if (search.active === true) {
            if (!this.is(this.list.data[index], regex)) {
              return;
            }
          }

          this.renderListElement(
            ul,
            this.list.data[index],
            index < this.list.data.length - 1,
          );
        }, 1);
      })(x);
    }
  }

  /**
   * @private
   * @param {HTMLUListElement} ul
   * @param {AlertList_Alert} alert
   * @param {boolean} hasBorder
   */
  renderListElement(ul, alert, hasBorder) {
    ul.appendChild(
      utils.create.alertItem({
        alert,
        container: "li",
        hasBorder: hasBorder,
      }),
    );
  }

  /**
   * @private
   * @param {AlertList_Alert} alert
   * @param {RegExp} regex
   * @returns {boolean}
   */
  is(alert, regex) {
    const alertNumbers = [];

    for (let n = alert.from; n <= alert.to; n++) {
      alertNumbers.push(n);
    }

    return !!`${alertNumbers.join(",")} ${alert.alert}`.match(regex);
  }
}
