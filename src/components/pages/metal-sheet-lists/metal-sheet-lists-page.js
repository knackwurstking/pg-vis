import { draggable, html, styles, UIStackLayoutPage } from "ui";
import { MetalSheetCreateDialog } from "../..";
import { pages } from "../../../data/constants";
import { utils } from "../../../lib";
import {
  MetalSheetModifyEntryDialog,
  MetalSheetNewEntryDialog,
} from "./dialogs";
import { MetalSheetActions } from "./metal-sheet-actions";

export class MetalSheetListsPage extends UIStackLayoutPage {
  static register = () => {
    MetalSheetModifyEntryDialog.register();
    MetalSheetNewEntryDialog.register();

    MetalSheetActions.register();

    customElements.define("metal-sheet-lists-page", MetalSheetListsPage);
  };

  constructor() {
    super(pages.metalSheetLists);

    /** @type {PGStore} */
    this.uiStore = document.querySelector("ui-store");

    /** @type {PGStore_MetalSheetList | null} */
    this.list = null;

    this.render();
  }

  render() {
    this.innerHTML = html`
      <div
        class="no-scrollbar"
        style="${styles(
          "width: 100%",
          "padding-top: var(--ui-app-bar-height)",
          "overflow-x: auto",
        )}"
      >
        <table>
          <thead>
            <tr></tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>

      <br />

      <metal-sheet-actions></metal-sheet-actions>
    `;

    this.style.overflow = "hidden";
    this.style.overflowY = "auto";
    this.className = "no-scrollbar";

    this.createMetalSheetActions();

    // Clear first
    const header = this.querySelector("thead > tr");
    const body = this.querySelector("tbody");

    while (!!header.firstChild) header.removeChild(header.firstChild);
    while (!!body.firstChild) body.removeChild(body.firstChild);

    // Return if data is null
    if (!this.list) return;

    // Render table
    for (const h of this.list.data.table.header) {
      const th = document.createElement("th");
      th.style.textAlign = "center";
      th.innerHTML = h;
      header.appendChild(th);
    }

    for (let x = 0; x < this.list.data.table.data.length; x++) {
      const tr = document.createElement("tr");
      tr.style.cursor = "pointer";
      tr.role = "button";
      tr.onclick = () => this.createModifyEntryDialog(x);
      tr.setAttribute(
        "data-json",
        JSON.stringify(this.list.data.table.data[x]),
      );
      body.appendChild(tr);

      for (const d of this.list.data.table.data[x]) {
        const td = document.createElement("td");
        td.style.textAlign = "center";
        td.innerHTML = d;
        tr.appendChild(td);
      }
    }

    draggable.createMobile(body, {
      onDragEnd: () => {
        /** @type {string[][]} */
        this.list.data.table.data = [...body.children].map((child) => {
          return JSON.parse(child.getAttribute("data-json"));
        });
        this.updateStore(this.list);
        this.set(this.list);
      },
    });
  }

  connectedCallback() {
    super.connectedCallback();

    this.uiStore.ui.set("edit", {
      onClick: async () => {
        const dialog = new MetalSheetCreateDialog("edit");
        dialog.set(this.list.format, this.list.toolID, this.list.data.press);

        dialog.ui.events.on("close", () => {
          document.body.removeChild(dialog);
        });

        dialog.ui.events.on("submit", (data) => {
          this.deleteStore(utils.getMetalSheetKey(this.list));

          this.list.format = data.format;
          this.list.toolID = data.toolID;
          this.list.data.press = data.press;

          this.set(this.list);
          this.updateStore(this.list);
        });

        document.body.appendChild(dialog);
        dialog.ui.open(true);
      },
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.uiStore.ui.set("edit", null);
  }

  /** @param {PGStore_MetalSheetList | null} list */
  set(list) {
    this.list = list;

    if (list === null) {
      this.uiStore.ui.set("appBarTitle", "");
      return;
    }

    let title = list.format;

    if (!!list.toolID) {
      title = `${title} - ${list.toolID}`;
    }

    if (list.data.press > -1) {
      title = `${title} [P${list.data.press}]`;
    }

    this.uiStore.ui.set("appBarTitle", title);
    this.render();
  }

  /**
   * @private
   * @param {PGStore_MetalSheetList} list
   */
  updateStore(list) {
    this.uiStore.ui.update("metalSheetLists", (lists) => {
      const key = utils.getMetalSheetKey(list);
      lists = [...lists.filter((l) => utils.getMetalSheetKey(l) !== key), list];
      return lists;
    });
  }

  /**
   * @private
   * @param {string} key
   */
  deleteStore(key) {
    this.uiStore.ui.update("metalSheetLists", (lists) => {
      lists = lists.filter((list) => utils.getMetalSheetKey(list) !== key);
      return lists;
    });
  }

  /** @private */
  createMetalSheetActions() {
    /** @type {MetalSheetActions} */
    const metalSheetActions = this.querySelector("metal-sheet-actions");

    metalSheetActions.events.on("new-entry", () => this.createNewEntryDialog());
  }

  /**
   * @private
   * @param {number} i
   */
  createModifyEntryDialog(i) {
    const dialog = new MetalSheetModifyEntryDialog();

    dialog.set({
      header: this.list.data.table.header,
      data: this.list.data.table.data[i],
    });

    dialog.ui.events.on("close", () => {
      document.body.removeChild(dialog);
    });

    dialog.ui.events.on("submit", (bd) => {
      this.list.data.table.data[i] = bd;
      this.set(this.list);
      this.updateStore(this.list);
    });

    dialog.ui.events.on("delete", () => {
      this.list.data.table.data = [
        ...this.list.data.table.data.slice(0, i),
        ...this.list.data.table.data.slice(i + 1),
      ];
      this.set(this.list);
      this.updateStore(this.list);
    });

    document.body.appendChild(dialog);
    dialog.ui.open(true);
  }

  /** @private */
  createNewEntryDialog() {
    const dialog = new MetalSheetNewEntryDialog();

    dialog.set({
      header: this.list.data.table.header,
      data: null,
    });

    dialog.ui.events.on("close", () => {
      document.body.removeChild(dialog);
    });

    dialog.ui.events.on("submit", (data) => {
      this.list.data.table.data.push(data);
      this.set(this.list);
      this.updateStore(this.list);
    });

    document.body.appendChild(dialog);
    dialog.ui.open(true);
  }
}
