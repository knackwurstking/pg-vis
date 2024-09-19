import { html, UIDialog, UIFlexGridItem } from "ui";

/**
 * @typedef VisDataEditDialog_Events
 * @type {import("ui").UIDialog_Events & { submit: VisDataEditDialog_Submit }}
 *
 * @typedef VisDataEditDialog_Submit
 * @type {{ title: string }}
 */

/**
 * @extends {UIDialog<VisDataEditDialog_Events>}
 */
export class VisDataEditDialog extends UIDialog {
  static register = () => {
    customElements.define("vis-data-edit-dialog", VisDataEditDialog);
  };

  /**
   * @param {string} originTitle
   */
  constructor(originTitle) {
    super("Liste Bearbeiten");

    /** @type {PGStore} */
    this.uiStore = document.querySelector("ui-store");

    this.originTitle = originTitle || "";

    this.render();
  }

  render() {
    this.innerHTML = html`
      <ui-flex-grid gap="0.5rem">
        <ui-flex-grid-item name="format">
          <ui-input
            name="title"
            type="text"
            title="Title"
            value="${this.originTitle}"
          ></ui-input>
        </ui-flex-grid-item>
      </ui-flex-grid>
    `;

    this.createCancel();
    this.createSubmit();
  }

  /**
   * @returns {VisDataEditDialog_Submit | null}
   */
  getData() {
    const data = {};

    /** @type {import("ui").UIInput<import("ui").UIInput_Events>} */
    const input = this.querySelector(`ui-input[name="title"]`);
    if (!input.ui.value) {
      input.ui.invalid = true;
      return null;
    }

    input.ui.invalid = false;
    data.title = input.ui.value;

    return data;
  }

  /** @private */
  createCancel() {
    const item = new UIFlexGridItem();
    item.ui.flex = "0";
    item.slot = "actions";
    item.innerHTML = html`
      <ui-button variant="full" color="secondary">Cancel</ui-button>
    `;

    /**
     * @type {import("ui").UIButton}
     */
    const button = item.querySelector("ui-button");

    button.ui.events.on("click", () => {
      this.ui.close();
    });

    this.appendChild(item);
  }

  /** @private */
  createSubmit() {
    const item = new UIFlexGridItem();
    item.ui.flex = "0";
    item.slot = "actions";
    item.innerHTML = html`
      <ui-button variant="full" color="primary">Submit</ui-button>
    `;

    /**
     * @type {import("ui").UIButton}
     */
    const button = item.querySelector("ui-button");

    button.ui.events.on("click", () => {
      const data = this.getData();
      if (data === null) return;
      this.ui.events.dispatch("submit", data);
      this.ui.close();
    });

    this.appendChild(item);
  }
}
