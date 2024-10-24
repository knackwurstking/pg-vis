import {
  html,
  UIButton,
  UIDialog,
  UIFlexGrid,
  UIFlexGridItem,
  UIInput,
} from "ui";

/**
 * @typedef MetalSheetModifyEntryDialogEvents
 * @type {import("ui").UIDialog_Events & { submit: string[], delete: null }}
 */

/**
 * @extends {UIDialog<MetalSheetModifyEntryDialogEvents>}
 */
export class MetalSheetModifyEntryDialog extends UIDialog {
  static register = () => {
    customElements.define(
      "metal-sheet-modify-entry-dialog",
      MetalSheetModifyEntryDialog,
    );
  };

  constructor() {
    super("Eintrag bearbeiten");
    this.render();
  }

  render() {
    const grid = new UIFlexGrid();
    grid.ui.gap = "0.5rem";
    this.appendChild(grid);

    this.createCancelButton();
    this.createDeleteButton();
    this.createSubmitButton();
  }

  connectedCallback() {
    super.connectedCallback();
  }

  /**
   * @param {Object} options
   * @param {string[]} options.header
   * @param {string[] | null} [options.data]
   */
  set({ header, data = null }) {
    const grid = this.querySelector("ui-flex-grid");
    while (!!grid.firstChild) grid.removeChild(grid.firstChild);

    for (let x = 0; x < header.length; x++) {
      const item = new UIFlexGridItem();
      item.innerHTML = html`
        <ui-input title="${header[x]}" value="${data?.[x] || ""}"></ui-input>
      `;

      grid.appendChild(item);
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
  createDeleteButton() {
    const item = new UIFlexGridItem();
    item.ui.flex = "0";
    item.slot = "actions";
    item.innerHTML = html`
      <ui-button variant="full" color="destructive">Delete</ui-button>
    `;

    /**
     * @type {UIButton}
     */
    const button = item.querySelector("ui-button");

    button.ui.events.on("click", () => {
      this.ui.events.dispatch("delete", null);
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
      /**
       * @type {string[]}
       */
      const data = [];
      const grid = this.querySelector("ui-flex-grid");
      for (const child of [...grid.children]) {
        /**
         * @type {UIInput<import("ui").UIInput_Events>}
         */
        const input = child.querySelector("ui-input");
        data.push(input.ui.value);
      }

      this.ui.events.dispatch("submit", data);
      this.ui.close();
    });

    this.appendChild(item);
  }
}
