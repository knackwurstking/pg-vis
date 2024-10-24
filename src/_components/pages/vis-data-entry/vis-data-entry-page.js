import { html, styles, UIStackLayoutPage } from "ui";
import { pages } from "../../../data/constants";
import { utils } from "../../../lib";

const storeKey = "visData";

export class VisDataEntryPage extends UIStackLayoutPage {
  static register = () => {
    customElements.define("vis-data-entry-page", VisDataEntryPage);
  };

  constructor() {
    super(pages.visDataEntry);
    /** @type {PGStore} */
    this.uiStore = document.querySelector("ui-store");

    /** @type {import("ui").UIStackLayout} */
    this.stackLayout = document.querySelector("ui-stack-layout");

    /** @type {string} */
    this.listTitle;
    /** @type {VisData_Entry} */
    this.listEntry;
    /** @type {number} */
    this.listIndex;

    this.render();
  }

  render() {
    this.style.paddingTop = "var(--ui-app-bar-height)";
    this.style.height = "100%";
    this.innerHTML = html`
      <div
        class="inputs"
        style="${styles(
          "width: 100%",
          "height: calc(100% - 3rem)",
          "overflow: hidden",
        )}"
      >
        <div
          class="no-scrollbar"
          style="${styles("overflow: auto", "width: 100%", "height: 100%")}"
        >
          <ui-input name="key" type="text" title="Key"></ui-input>

          <br />

          <ui-textarea
            name="value"
            type="text"
            title="Value"
            rows="10"
          ></ui-textarea>

          <br />

          <ui-input name="lotto" type="text" title="Lotto"></ui-input>

          <br />

          <ui-input name="format" type="text" title="Format"></ui-input>

          <br />

          <ui-input name="stamp" type="string" title="Stempel"></ui-input>

          <br />

          <ui-input name="thickness" type="string" title="Stärke"></ui-input>
        </div>
      </div>

      <div
        class="actions"
        style="${styles(
          "width: 100%",
          "height: 2.5rem",
          "padding-top: var(--ui-spacing)",
        )}"
      >
        <ui-flex-grid-row justify="flex-end" gap="0.25rem">
          <ui-flex-grid-item flex="0">
            <ui-button name="delete" variant="full" color="destructive">
              Delete
            </ui-button>
          </ui-flex-grid-item>

          <ui-flex-grid-item flex="0">
            <ui-button name="submit" variant="full" color="primary">
              Submit
            </ui-button>
          </ui-flex-grid-item>
        </ui-flex-grid-row>
      </div>
    `;

    /** @type {import("ui").UIButton} */
    const submitButton = this.querySelector(`ui-button[name="submit"]`);
    submitButton.ui.events.on("click", () => {
      const entry = this.getData();
      if (!entry) return;

      this.uiStore.ui.update(storeKey, (lists) => {
        const key = utils.getVisDataKey({ title: this.listTitle });
        return lists.map((list) => {
          if (utils.getVisDataKey(list) === key) {
            if (this.listIndex > -1) {
              list.data = list.data.filter((_e, i) => i !== this.listIndex);
            }

            return {
              ...list,
              data: [...list.data, entry],
            };
          }

          return list;
        });
      });

      this.stackLayout.ui.goBack();
    });

    /** @type {import("ui").UIButton} */
    const deleteButton = this.querySelector(`ui-button[name="delete"]`);
    deleteButton.ui.events.on("click", async () => {
      this.uiStore.ui.update(storeKey, (lists) => {
        const key = utils.getVisDataKey({ title: this.listTitle });

        return lists.map((list) => {
          if (utils.getVisDataKey(list) === key) {
            list.data = list.data.filter((_e, i) => i !== this.listIndex);
            return list;
          }

          return list;
        });
      });

      this.stackLayout.ui.goBack();
    });
  }

  /**
   * @param {string} title
   * @param {number} index
   * @param {VisData_Entry} entry
   */
  set(title, index, entry) {
    this.listTitle = title;
    this.listEntry = entry;
    this.listIndex = index;

    /** @type {import("ui").UIInput<import("ui").UIInput_Events>} */
    let input;

    input = this.querySelector(`ui-input[name="key"]`);
    input.ui.value = entry.key;

    input = this.querySelector(`ui-textarea[name="value"]`);
    input.ui.value = entry.value;

    input = this.querySelector(`ui-input[name="lotto"]`);
    input.ui.value = entry.lotto?.replaceAll(".*", " ") || null;

    input = this.querySelector(`ui-input[name="format"]`);
    input.ui.value = entry.format?.replaceAll(".*", " ") || null;

    input = this.querySelector(`ui-input[name="stamp"]`);
    input.ui.value = entry.stamp?.replaceAll(".*", " ") || null;

    input = this.querySelector(`ui-input[name="thickness"]`);
    input.ui.value = entry.thickness?.replaceAll(".*", " ") || null;

    /** @type {import("ui").UIButton} */
    const deleteItem = this.querySelector(`ui-button[name="delete"]`);
    deleteItem.ui.disabled = !entry.key;
  }

  /**
   * @returns {VisData_Entry | null}
   */
  getData() {
    /**
     * @type {VisData_Entry}
     */
    const entry = {
      key: "",
      value: "",
      lotto: null,
      format: null,
      thickness: null,
      stamp: null,
    };

    /** @type {import("ui").UIInput<import("ui").UIInput_Events>} */
    let input;

    input = this.querySelector(`ui-input[name="key"]`);
    entry.key = input.ui.value;
    if (!entry.key) {
      input.ui.invalid = true;
      return null;
    }

    input = this.querySelector(`ui-textarea[name="value"]`);
    entry.value = input.ui.value;
    if (!entry.value) {
      input.ui.invalid = true;
      return null;
    }

    input = this.querySelector(`ui-input[name="lotto"]`);
    entry.lotto = input.ui.value?.trim().replace(" ", ".*") || null;

    input = this.querySelector(`ui-input[name="format"]`);
    entry.format = input.ui.value?.trim().replace(" ", ".*") || null;

    input = this.querySelector(`ui-input[name="stamp"]`);
    entry.stamp = input.ui.value?.trim().replace(" ", ".*") || null;

    input = this.querySelector(`ui-input[name="thickness"]`);
    entry.thickness = input.ui.value?.trim().replace(" ", ".*") || null;

    return entry;
  }
}
