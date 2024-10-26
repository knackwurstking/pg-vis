import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { svg, UIDrawerGroupItem, UIStackLayoutPage } from "ui";
import PGApp from "./pg-app";
import { PGStackLayoutPage } from "../types";

/**
 * ```
 *  <pg-drawer-item
 *       store-key="alertLists"
 *       store-key-entry="Alert List 2"
 *       primary="Alert List 2"
 *       secondary=""
 *       allowDeletion
 *  ></pg-drawer-item>
 * ```
 */
@customElement("pg-drawer-item")
class PGDrawerItem extends UIDrawerGroupItem {
    storeKey?: "alertLists"; // TODO: Add: "metalSheets" | "vis" | "visBookmarks" | "visData"

    /**
     * Entry to access, or delete, from the global ui-store element
     */
    @property({ type: String, attribute: "store-key-entry", reflect: true })
    storeKeyEntry?: string;

    @property({ type: String, attribute: "primary", reflect: true })
    primary?: string;

    @property({ type: String, attribute: "secondary", reflect: true })
    secondary?: string;

    @property({ type: Boolean, attribute: "allow-deletion", reflect: true })
    allowDeletion?: boolean;

    protected render() {
        return html`
            <ui-flex-grid-row>
                <ui-flex-grid-item>
                    <ui-label
                        primary="${this.primary || ""}"
                        secondary="${this.secondary || ""}"
                        ripple
                        @click=${async (): Promise<void> => {
                            await this.setStackLayoutPage();
                            PGApp.queryDrawer()!.open = false;
                        }}
                    ></ui-label>
                </ui-flex-grid-item>

                ${this.allowDeletion
                    ? html`<ui-flex-grid-item
                          name="delete"
                          class="flex align-center justify-center"
                          flex="0"
                      >
                          <ui-icon-button
                              style="height: 100%"
                              color="destructive"
                              ghost
                              ripple
                              @click=${async (): Promise<void> => {
                                  if (
                                      this.storeKey === undefined ||
                                      !this.storeKeyEntry === undefined
                                  ) {
                                      return;
                                  }

                                  PGApp.queryStore().updateData(
                                      this.storeKey,
                                      (data) => {
                                          return data.filter(
                                              (entry) =>
                                                  entry.title !==
                                                  this.storeKeyEntry,
                                          );
                                      },
                                  );
                              }}
                          >
                              ${svg.smoothieLineIcons.trash}
                          </ui-icon-button>
                      </ui-flex-grid-item>`
                    : ""}
            </ui-flex-grid-row>
        `;
    }

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    public async setStackLayoutPage() {
        if (!this.storeKey) return;

        const data = PGApp.queryStore()
            .getData(this.storeKey!)
            ?.find((list) => list.title === this.storeKeyEntry);

        if (data === undefined) {
            throw new Error(
                `Data undefined for "${this.storeKeyEntry}" in "${this.storeKey}"`,
            );
        }

        const stack = PGApp.queryStackLayout()!;
        stack.set(this.storeKey, async (page) => {
            // TODO: Set page data here...
        });
    }
}

export default PGDrawerItem;
