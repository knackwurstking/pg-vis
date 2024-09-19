import {
  html,
  UIButton,
  UIDialog,
  UIFlexGrid,
  UIFlexGridItem,
  UIInput,
} from "ui";
import { utils } from "../../lib";

/**
 * @typedef {UIInput<import("ui").UIInput_Events>} TextInput
 * @typedef {{
 *  title: string;
 * }} NewVisDataSubmit
 */

/**
 * @extends {UIDialog<import("ui").UIDialog_Events & { submit: NewVisDataSubmit }>}
 */
export class NewVisDataDialog extends UIDialog {
  static register = () => {
    customElements.define("new-vis-data-dialog", NewVisDataDialog);
  };

  constructor() {
    super("New Vis Data");

    /** @type {PGStore} */
    this.uiStore = document.querySelector("ui-store");

    /** @type {TextInput} */
    this.name = null;

    this.render();
  }

  render() {
    const grid = new UIFlexGrid();
    grid.ui.gap = "0.5rem";
    grid.innerHTML = html`
      <ui-flex-grid-item>
        <ui-input name="title" type="text" title="Vis Data Title"></ui-input>
      </ui-flex-grid-item>
    `;

    this.appendChild(grid);

    this.name = this.querySelector(`[name="title"]`);

    this.createCancelButton();
    this.createSubmitButton();
  }

  connectedCallback() {
    super.connectedCallback();
    this.resets();
  }

  /** @private */
  resets() {
    if (!!this.name) {
      this.name.ui.invalid = false;
      this.name.ui.value = "";
    }
  }

  /** @private */
  createCancelButton() {
    const item = new UIFlexGridItem();
    item.ui.flex = "0";
    item.slot = "actions";
    item.innerHTML = html`
      <ui-button variant="full" color="secondary">Cancel</ui-button>
    `;

    /**
     * @type {UIButton}
     */
    const button = item.querySelector("ui-button");

    button.ui.events.on("click", () => {
      this.ui.close();
    });

    this.appendChild(item);
  }

  /** @private */
  createSubmitButton() {
    const item = new UIFlexGridItem();
    item.ui.flex = "0";
    item.slot = "actions";
    item.innerHTML = html`
      <ui-button variant="full" color="primary">Submit</ui-button>
    `;

    /**
     * @type {UIButton}
     */
    const button = item.querySelector("ui-button");

    button.ui.events.on("click", () => {
      if (!this.name.ui.value) {
        this.name.ui.invalid = true;
        return;
      }

      const key = utils.getVisDataKey({ title: this.name.ui.value });
      const match = !!this.uiStore.ui
        .get("visData")
        .find((data) => utils.getVisDataKey(data) === key);
      if (match) {
        this.name.ui.invalid = true;
        return;
      }

      this.name.ui.invalid = false;

      this.ui.events.dispatch("submit", {
        title: this.name.ui.value,
      });

      this.ui.close();
    });

    this.appendChild(item);
  }
}
