import {
  html,
  UIButton,
  UIDialog,
  UIFlexGrid,
  UIFlexGridItem,
  UIInput,
} from "ui";

/**
 * @typedef ImportDialogEvents
 * @type {import("ui").UIDialog_Events & { submit: string }}
 */

/**
 * Asking for the gist ID, or just import from a file
 *
 * @extends {UIDialog<ImportDialogEvents>}
 */
export class ImportDialog extends UIDialog {
  static register = () => {
    customElements.define("import-dialog", ImportDialog);
  };

  /**
   * @param {string} title
   */
  constructor(title) {
    super(`Import "${title}"`);

    /** @type {UIInput<import("ui").UIInput_Events>} */
    this.gistID = null;

    this.render();
  }

  render() {
    const grid = new UIFlexGrid();
    grid.ui.gap = "0.5rem";
    grid.innerHTML = html`
      <ui-flex-grid-item>
        <ui-label
          secondary="Zum Importieren einer Datei leer lassen"
        ></ui-label>
      </ui-flex-grid-item>

      <ui-flex-grid-item>
        <ui-input name="gistID" type="text" title="Gist ID"></ui-input>
      </ui-flex-grid-item>
    `;

    this.appendChild(grid);

    this.gistID = this.querySelector(`ui-input[name="gistID"]`);

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
      this.ui.events.dispatch("submit", this.gistID.ui.value);

      this.ui.close();
    });

    this.appendChild(item);
  }
}
