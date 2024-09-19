import { html, UIDialog } from "ui";
import { utils } from "../../lib";

/** @extends {UIDialog<import("ui").UIDialog_Events>} */
export class BookmarkDialog extends UIDialog {
  static register = () => {
    customElements.define("bookmark-dialog", BookmarkDialog);
  };

  constructor() {
    super("Vis Listen");
    /** @type {PGStore} */
    this.uiStore = document.querySelector("ui-store");
    this.render();
  }

  render() {
    this.innerHTML = html``;

    for (const list of utils.sort.visLists(this.uiStore.ui.get("visLists"))) {
      const key = utils.getVisListKey(list);
      this.innerHTML += html`
        <ui-check primary="${list.name}" value="${key}"></ui-check>
      `;
    }

    this.ui.nofooter = true;
  }

  /**
   * @param {Vis_Product} product
   */
  set(product) {
    [...this.querySelectorAll("ui-check")].forEach(
      (/**@type {import("ui").UICheck}*/ child) => {
        let list = this.getList(child.ui.value);
        child.ui.checked = this.isBookmark(list, product);
        child.oninput = () => {
          if (child.ui.checked) {
            list = this.addBookmark(list, product);
          } else {
            list = this.removeBookmark(list, product);
          }

          this.uiStore.ui.update("visLists", (lists) => {
            console.debug(`udpate "visLists"`);
            return lists;
          });
        };
      },
    );
  }

  /**
   * @param {string} listKey
   * @returns {PGStore_VisList}
   */
  getList(listKey) {
    const list = this.uiStore.ui
      .get("visLists")
      .find((list) => utils.getVisListKey(list) === listKey);

    if (!list) {
      throw new Error(`list "${listKey}" not found`);
    }

    return list;
  }

  /**
   * @param {PGStore_VisList} list
   * @param {Vis_Product} product
   * @returns {boolean}
   */
  isBookmark(list, product) {
    if (
      !!list?.data.find(
        (e) =>
          e.name === product.name &&
          e.lotto === product.lotto &&
          e.stamp === product.stamp &&
          e.format === product.format &&
          e.thickness === product.thickness,
      )
    ) {
      return true;
    }

    return false;
  }

  /**
   * @param {PGStore_VisList} list
   * @param {Vis_Product} product
   * @returns {PGStore_VisList}
   */
  addBookmark(list, product) {
    if (this.isBookmark(list, product)) {
      return list;
    }

    list.data.push(product);
    return list;
  }

  /**
   * @param {PGStore_VisList} list
   * @param {Vis_Product} product
   * @returns {PGStore_VisList}
   */
  removeBookmark(list, product) {
    if (!this.isBookmark(list, product)) {
      return list;
    }

    list.data = list.data.filter(
      (e) =>
        e.name !== product.name ||
        e.lotto !== product.lotto ||
        e.stamp !== product.stamp ||
        e.format !== product.format ||
        e.thickness !== product.thickness,
    );

    return list;
  }
}
