import { UIDrawerGroupItem } from "ui";
import { html } from "ui";
import { NewVisDataDialog } from "..";
import { MetalSheetCreateDialog } from "..";

/**
 * Attributes:
 *  - **type**: "metalSheetLists" | "vis-lists" | "vis-data"
 */
export class PGDrawerItemNew extends UIDrawerGroupItem {
  static register = () => {
    customElements.define("pg-drawer-item-new", PGDrawerItemNew);
  };

  constructor() {
    super();

    /** @type {PGStore} */
    this.uiStore = document.querySelector("ui-store");

    this.render();
  }

  render() {
    this.innerHTML = html`
      <ui-button variant="full" color="secondary">Neue Liste</ui-button>
    `;

    /** @type {import("ui").UIButton} */
    const button = this.querySelector("ui-button");
    button.ui.events.on("click", () => {
      switch (this.getAttribute("type")) {
        case "metal-sheet-lists":
        case "metalSheetLists":
          this.newMetalSheetLists();
          break;

        case "vis-data":
        case "visData":
          this.newVisData();
          break;

        default:
          return;
      }
    });
  }

  newMetalSheetLists() {
    const dialog = new MetalSheetCreateDialog("create");

    dialog.ui.events.on("close", () => {
      document.body.removeChild(dialog);
    });

    dialog.ui.events.on("submit", (data) => {
      if (data === null) {
        return;
      }

      this.uiStore.ui.update("metalSheetLists", (lists) => {
        lists = [
          ...lists,
          {
            format: data.format,
            toolID: data.toolID,
            data: {
              press: data.press,
              table: {
                header: [
                  "Stärke",
                  "Marke (Höhe)",
                  "Blech Stempel",
                  "Blech Marke",
                  "Stf. P2-5",
                  "Stf. P0",
                ],
                data: [],
              },
            },
          },
        ];
        return lists;
      });
    });

    document.body.appendChild(dialog);
    dialog.ui.open(true);
  }

  newVisData() {
    const dialog = new NewVisDataDialog();

    dialog.ui.events.on("close", () => {
      document.body.removeChild(dialog);
    });

    dialog.ui.events.on("submit", (submitData) => {
      this.uiStore.ui.update("visData", (data) => {
        data.unshift({
          ...submitData,
          data: [],
        });
        return data;
      });
    });

    document.body.appendChild(dialog);
    dialog.ui.open(true);
  }
}
