import { CleanUp, html, styles, UIStackLayoutPage } from "ui";
import { pages } from "../../../data/constants";
import { utils } from "../../../lib";
import { VisDataEditDialog } from "./dialogs/vis-data-edit-dialog";

/**
 * @typedef {import("../vis-data-entry").VisDataEntryPage} VisDataEntryPage
 */

const storeKey = "visData";

export class VisDataPage extends UIStackLayoutPage {
  static register = () => {
    VisDataEditDialog.register();
    customElements.define("vis-data-page", VisDataPage);
  };

  constructor() {
    super(pages.visData);
    this.cleanup = new CleanUp();

    /** @type {PGStore} */
    this.uiStore = document.querySelector("ui-store");

    /** @type {import("ui").UIStackLayout} */
    this.stackLayout = document.querySelector("ui-stack-layout");

    /**
     * @type {PGStore_VisData | null}
     */
    this.data = null;

    /**
     * @param {PGStore_VisData} data
     */
    this.onVisData = (data) => {
      this.set(data);
    };

    this.render();
  }

  render() {
    this.style.paddingTop = "var(--ui-app-bar-height)";
    this.innerHTML = html`
      <ui-flex-grid-row justify="flex-end" gap="0.25rem">
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

      <ul
        class="no-scrollbar list"
        style="${styles(
          "overflow: hidden",
          "overflow-y: auto",
          "width: 100%",
          "height: calc(100% - 1rem - var(--ui-app-bar-height))",
          "margin: 0",
        )}"
      ></ul>
    `;

    this.uiStore.ui.set("appBarTitle", `Vis Data`);

    /** @type {import("ui").UIButton} */
    const button = this.querySelector(`[name="new-entry"]`);

    button.ui.events.on("click", () => {
      this.stackLayout.ui.set(
        pages.visDataEntry,

        (/** @type {VisDataEntryPage} */ page) => {
          page.set(this.data.title, -1, {
            key: "",
            value: "",
            lotto: null,
            format: null,
            thickness: null,
            stamp: null,
          });
        },

        true,
      );
    });

    utils.events.addEventListener(
      this.querySelector("ul.list"),
      "click",
      `[data-vis-data-item]`,
      (_ev, target) => {
        this.stackLayout.ui.set(
          pages.visDataEntry,
          (/** @type {VisDataEntryPage} */ page) => {
            page.set(
              this.data.title,
              parseInt(target.getAttribute("data-index")),
              JSON.parse(target.getAttribute("data-json")),
            );
          },
          true,
        );
      },
    );
  }

  connectedCallback() {
    super.connectedCallback();

    this.uiStore.ui.set("edit", {
      onClick: () => {
        const dialog = new VisDataEditDialog(this.data.title);
        document.body.appendChild(dialog);

        dialog.ui.events.on("close", () => {
          document.body.removeChild(dialog);
        });

        const key = utils.getVisDataKey(this.data);
        dialog.ui.events.on("submit", (data) => {
          this.uiStore.ui.update(storeKey, (lists) => {
            return lists.map((list) => {
              if (utils.getVisDataKey(list) === key) {
                list.title = data.title || this.data.title;
              }

              return list;
            });
          });
        });

        dialog.ui.open(true);
      },
    });

    this.cleanup.add(
      this.uiStore.ui.on(storeKey, (lists) => {
        const key = utils.getVisDataKey(this.data);
        for (const list of lists) {
          if (utils.getVisDataKey(list) === key) {
            this.onVisData(list);
            return;
          }
        }
      }),
    );
  }

  disconnectedCallback() {
    this.cleanup.run();
    this.uiStore.ui.set("edit", null);
  }

  /**
   * @param {PGStore_VisData} data
   */
  set(data) {
    this.data = utils.sort.visDataEntries(data);
    this.uiStore.ui.set("appBarTitle", `Vis Data - ${this.data.title}`);

    const list = this.querySelector("ul.list");
    while (!!list.firstChild) list.removeChild(list.firstChild);

    for (let i = 0; i < this.data.data.length; i++) {
      ((index) => {
        setTimeout(() => {
          const item = utils.create.visDataItem({
            index,
            entry: this.data.data[index],
          });

          list.appendChild(item);
        }, 1);
      })(i);
    }
  }
}
