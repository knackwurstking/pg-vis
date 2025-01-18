import { customElement, property } from "lit/decorators.js";

import { html, LitElement } from "lit";
import { svg, UISpinner } from "ui";

import * as app from "@app";
import * as lib from "@lib";

@customElement("pg-drawer-item")
class PGDrawerItem extends LitElement {
    @property({ type: String, attribute: "store-key", reflect: true })
    storeKey?: keyof lib.listStores.ListStoreData;

    /**
     * Entry to access, or delete, from the global ui-store element
     */
    @property({ type: String, attribute: "store-list-key", reflect: true })
    storeListKey?: string;

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
        let lock = false;

        return html`
            <ui-flex-grid-row>
                <ui-flex-grid-item>
                    <ui-label
                        role="button"
                        style="cursor: pointer;"
                        primary="${this.primary || ""}"
                        secondary="${this.secondary || ""}"
                        ripple
                        @click=${async (): Promise<void> => {
                            if (lock) return;
                            lock = true;

                            const spinner = new UISpinner();
                            spinner.id = "pageLoadSpinner";
                            document.querySelector(`pg-app`)!.appendChild(spinner);

                            setTimeout(async () => {
                                try {
                                    await this.setStackLayoutPage();
                                    app.PGApp.queryDrawer()!.open = false;
                                } finally {
                                    lock = false;

                                    setTimeout(() => {
                                        spinner.parentElement?.removeChild(spinner);
                                    });
                                }
                            });
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
                                  if (lock) return;
                                  lock = true;

                                  setTimeout(async () => {
                                      try {
                                          await this.deleteStoreData();
                                      } finally {
                                          lock = false;
                                      }
                                  });
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

        const listsStore = lib.listStore(this.storeKey);
        const storeData = app.PGApp.queryStore().getData(this.storeKey);
        const data = storeData?.find((list) => listsStore.listKey(list) === this.storeListKey);

        if (data === undefined) {
            throw new Error(`Data undefined for "${this.storeListKey}" in "${this.storeKey}"`);
        }

        const stack = app.PGApp.queryStackLayout()!;
        stack.clearStack();
        stack.setPage(this.storeKey!, async (page) => {
            const content = page.children[0] as app.PGPageContent<any> | undefined;
            if (content !== undefined) {
                content.data = data;
            }
        });
    }

    protected async deleteStoreData() {
        if (!this.storeKey || !this.storeListKey) {
            return;
        }

        switch (this.storeKey) {
            case "alertLists":
            case "metalSheets":
            case "vis":
            case "visBookmarks":
            case "visData":
            case "special":
                if (confirm(`Möchten Sie "${this.storeListKey}" wirklich löschen?`)) {
                    const listsStore = lib.listStore(this.storeKey);
                    app.PGApp.queryStore().updateData(this.storeKey, (data) => {
                        return data.filter(
                            (list) => listsStore.listKey(list) !== this.storeListKey,
                        ) as any[];
                    });
                }
        }
    }
}

export default PGDrawerItem;
