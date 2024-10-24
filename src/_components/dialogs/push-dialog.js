import {
  html,
  UIButton,
  UIDialog,
  UIFlexGrid,
  UIFlexGridItem,
  UIInput,
} from "ui";

/**
 * @typedef PushDialogEvents
 * @type {import("ui").UIDialog_Events & { submit: string | null }}
 */

/**
 * Asking for the gist ID, or just import from a file
 *
 * @extends {UIDialog<PushDialogEvents>}
 */
export class PushDialog extends UIDialog {
  static register = () => {
    customElements.define("push-dialog", PushDialog);
  };

  constructor() {
    super(`Gist Token`);

    /** @type {UIInput<import("ui").UIInput_Events>} */
    this.token = null;

    this.render();
  }

  render() {
    const grid = new UIFlexGrid();
    grid.ui.gap = "0.5rem";
    grid.innerHTML = html`
      <ui-flex-grid-item>
        <ui-label
          secondary="Für Schreibzugriff ist ein Token erforderlich."
        ></ui-label>
      </ui-flex-grid-item>

      <ui-flex-grid-item>
        <ui-input name="token" type="text" title="Gist Token"></ui-input>
      </ui-flex-grid-item>
    `;

    this.appendChild(grid);

    this.token = this.querySelector(`ui-input[name="token"]`);

    this.createCancelButton();
    this.createSubmitButton();
  }

  connectedCallback() {
    super.connectedCallback();
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
      if (!this.token.ui.value) {
        this.token.ui.invalid = true;
        return;
      }

      this.token.ui.invalid = false;
      this.ui.events.dispatch("submit", this.token.ui.value);
      this.ui.close();
    });

    this.appendChild(item);
  }
}
