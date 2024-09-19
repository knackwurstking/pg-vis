import {
  html,
  UIButton,
  UIDialog,
  UIFlexGrid,
  UIFlexGridItem,
  UIInput,
  UISelect,
} from "ui";
import { utils } from "../../lib";

/**
 * @typedef MetalSheetCreateDialogEvents
 * @type {import("ui").UIDialog_Events & { submit: MetalSheetCreateDialogSubmitData }}
 *
 * @typedef MetalSheetCreateDialogSubmitData
 * @type {{ format: string; toolID: string; press: number }}
 */

/**
 * Asking for the gist ID, or just import from a file
 *
 * @extends {UIDialog<MetalSheetCreateDialogEvents>}
 */
export class MetalSheetCreateDialog extends UIDialog {
  static register = () => {
    customElements.define("metal-sheet-create-dialog", MetalSheetCreateDialog);
  };

  /** @param {"create" | "edit"} mode */
  constructor(mode) {
    let title = "";
    switch (mode) {
      case "create":
        title = "Neue Liste";
        break;
      case "edit":
        title = "Liste Bearbeiten";
        break;
    }

    super(title);

    /** @private */
    this.mode = mode;

    /** @type {PGStore} */
    this.uiStore = document.querySelector("ui-store");

    this.originFormat = "";
    this.originToolID = "";

    this.render();
  }

  render() {
    const grid = new UIFlexGrid();
    grid.ui.gap = "0.5rem";
    grid.innerHTML = html`
      <ui-flex-grid-item name="format">
        <ui-input type="text" title="Format"></ui-input>
      </ui-flex-grid-item>

      <ui-flex-grid-item name="toolID">
        <ui-input type="text" title="Tool ID"></ui-input>
      </ui-flex-grid-item>

      <ui-flex-grid-item name="press">
        <ui-label primary="Presse">
          <ui-select slot="input">
            <ui-select-option value="-1" selected>-</ui-select-option>
            <ui-select-option value="0">0</ui-select-option>
            <ui-select-option value="2">2</ui-select-option>
            <ui-select-option value="3">3</ui-select-option>
            <ui-select-option value="4">4</ui-select-option>
            <ui-select-option value="5">5</ui-select-option>
          </ui-select>
        </ui-label>
      </ui-flex-grid-item>
    `;

    this.appendChild(grid);

    this.createCancelButton();
    this.createSubmitButton();
  }

  /**
   * @param {string} format
   * @param {string} toolID
   * @param {number} [press]
   */
  set(format, toolID, press = -1) {
    /**
     * @type {UIInput<import("ui").UIInput_Events>}
     */
    const formatInput = this.querySelector(`[name="format"] ui-input`);
    formatInput.ui.value = format;

    /**
     * @type {UIInput<import("ui").UIInput_Events>}
     */
    const toolIDInput = this.querySelector(`[name="toolID"] ui-input`);
    toolIDInput.ui.value = toolID;

    /**
     * @type {UISelect}
     */
    const pressSelect = this.querySelector(`[name="press"] ui-select`);
    pressSelect.ui.options().forEach((option) => {
      option.ui.selected = parseInt(option.ui.value) === press;
    });

    this.originFormat = format;
    this.originToolID = toolID;
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
      const data = this.getData();
      if (data === null) return;
      this.ui.events.dispatch("submit", data);
      this.ui.close();
    });

    this.appendChild(item);
  }

  /**
   * @private
   * @returns {MetalSheetCreateDialogSubmitData}
   */
  getData() {
    /**
     * @type {MetalSheetCreateDialogSubmitData}
     */
    const data = {
      format: "",
      toolID: "",
      press: -1,
    };

    /**
     * @type {UIInput<import("ui").UIInput_Events>}
     */
    const format = this.querySelector(`[name="format"] ui-input`);
    data.format = format.ui.value;

    /**
     * @type {UIInput<import("ui").UIInput_Events>}
     */
    const toolID = this.querySelector(`[name="toolID"] ui-input`);
    data.toolID = toolID.ui.value;

    /**
     * @type {UISelect}
     */
    const press = this.querySelector(`[name="press"] ui-select`);
    data.press = parseInt(press.ui.selected()?.ui.value || "-1", 10);

    if (data.format === "") {
      format.ui.invalid = true;
      return null;
    }

    const originKey = utils.getMetalSheetKey({
      format: this.originFormat,
      toolID: this.originToolID,
    });
    const key = utils.getMetalSheetKey(data);
    const match = this.uiStore.ui.get("metalSheetLists").find((list) => {
      if (this.mode === "edit" && originKey === key) {
        return false;
      }

      return utils.getMetalSheetKey(list) === key;
    });

    if (!!match) {
      format.ui.invalid =
        match.format === data.format && match.toolID !== data.toolID;
      toolID.ui.invalid = match.toolID === data.toolID;
      return null;
    }

    return data;
  }
}
