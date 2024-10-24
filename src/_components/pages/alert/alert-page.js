import { html, UIFlexGridItem, UIStackLayoutPage } from "ui";
import { pages } from "../../../data/constants";
import { utils } from "../../../lib";

export class AlertPage extends UIStackLayoutPage {
  static register = () => {
    customElements.define("alert-page", AlertPage);
  };

  constructor() {
    super(pages.alert);

    /** @type {PGStore} */
    this.uiStore = document.querySelector("ui-store");

    /** @type {AlertList_Alert | null} */
    this.alert = null;

    this.render();
  }

  render() {
    this.innerHTML = html`
      <ui-flex-grid style="width: 100%; height: 100%;">
        <ui-flex-grid-item class="alert" flex="0"> </ui-flex-grid-item>

        <ui-flex-grid-item class="desc"> </ui-flex-grid-item>
      </ui-flex-grid>
    `;

    this.className = "no-scrollbar";
    this.style.paddingTop =
      "calc(var(--ui-app-bar-height) + var(--ui-spacing))";
    this.style.overflow = "auto";
  }

  /**
   * @param {AlertList_Alert | null} alert
   */
  set(alert) {
    this.alert = alert;

    this.createAlertItem();
    this.createDescItem();
  }

  /** @private */
  createAlertItem() {
    const container = this.querySelector("ui-flex-grid-item.alert");

    while (!!container.firstChild) {
      container.removeChild(container.firstChild);
    }

    if (this.alert === null) {
      return;
    }

    container.appendChild(
      utils.create.alertItem({
        alert: this.alert,
        container: "div",
        hasRipple: false,
      }),
    );
  }

  /** @private */
  createDescItem() {
    /** @type {UIFlexGridItem} */
    const container = this.querySelector("ui-flex-grid-item.desc");

    while (!!container.firstChild) {
      container.removeChild(container.firstChild);
    }

    if (this.alert === null) {
      return;
    }

    const p = document.createElement("p");
    p.style.padding = "var(--ui-spacing)";
    p.innerHTML = this.alert.desc.join("\n");
    container.appendChild(p);
  }
}
