import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { svg, UIDrawerGroupItem } from "ui";
import PGPageContent from "./pages/pg-page-content";
import PGApp from "./pg-app";
import { ListsStoreData } from "../lib/lists-store";

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
    @property({ type: String, attribute: "store-key", reflect: true })
    storeKey?: keyof ListsStoreData;

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

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    protected render() {
        return html`
            <ui-flex-grid-row>
                <ui-flex-grid-item>
                    <ui-label
                        style="cursor: pointer;"
                        primary="${this.primary || ""}"
                        secondary="${this.secondary || ""}"
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
                                  await this.deleteStoreData();
                              }}
                          >
                              ${svg.smoothieLineIcons.trash}
                          </ui-icon-button>
                      </ui-flex-grid-item>`
                    : ""}
            </ui-flex-grid-row>
        `;
    }

    protected async setStackLayoutPage() {
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
        stack.clearStack();
        stack.setPage(this.storeKey, async (page) => {
            const content = page.children[0] as PGPageContent<any> | undefined;
            if (content !== undefined) {
                content.data = data;
            }
        });
    }

    protected async deleteStoreData() {
        if (this.storeKey === undefined || !this.storeKeyEntry === undefined) {
            return;
        }

        switch (this.storeKey) {
            case "alertLists":
            case "metalSheets":
            case "vis":
            case "visBookmarks":
            case "visData":
                if (
                    confirm(
                        `Möchten Sie "${this.storeKeyEntry}" wirklich löschen?`,
                    )
                ) {
                    PGApp.queryStore().updateData(this.storeKey, (data) => {
                        return data.filter(
                            (entry) => entry.title !== this.storeKeyEntry,
                        );
                    });
                }
        }
    }
}

export default PGDrawerItem;
