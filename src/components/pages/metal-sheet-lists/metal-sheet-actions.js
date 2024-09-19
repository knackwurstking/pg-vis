import { Events, html, UIFlexGridRow } from "ui";

export class MetalSheetActions extends UIFlexGridRow {
  static register = () => {
    customElements.define("metal-sheet-actions", MetalSheetActions);
  };

  constructor() {
    super();

    /** @type {Events<{ "new-entry": null }>} */
    this.events = new Events();

    this.render();
  }

  render() {
    this.innerHTML = html`
      <ui-flex-grid-row style="justify-content: flex-end;" gap="0.25rem">
        <ui-flex-grid-item flex="0">
          <ui-button
            name="new-entry"
            style="text-wrap: nowrap;"
            variant="full"
            color="primary"
          >
            Neuer Eintrag
          </ui-button>
        </ui-flex-grid-item>
      </ui-flex-grid-row>
    `;

    this.querySelector(`[name="new-entry"]`).addEventListener("click", () => {
      this.events.dispatch("new-entry", null);
    });
  }
}
