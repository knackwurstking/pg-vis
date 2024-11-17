import { customElement, property } from "lit/decorators.js";

import { LitElement } from "lit";
import { CleanUp, html, styles, UISpinner } from "ui";

import * as app from "@app";
import * as lib from "@lib";

@customElement("pg-drawer-item-gist")
class PGDrawerItemGist extends LitElement {
    @property({ type: String, attribute: "store-key", reflect: true })
    storeKey?: keyof lib.listStores.ListStoreData;

    @property({ type: Number, attribute: false, reflect: true })
    revision: number = 0;

    @property({ type: String, attribute: false, reflect: true })
    gistID: string = "";

    protected cleanup = new CleanUp();

    public startSpinner() {
        this.querySelector<UISpinner>("ui-spinner")!.style.display = "block";
    }

    public stopSpinner() {
        this.querySelector<UISpinner>("ui-spinner")!.style.display = "none";
    }

    connectedCallback(): void {
        super.connectedCallback();

        const store = app.PGApp.queryStore();

        this.cleanup.add(
            store.addListener(
                "gist",
                (data) => {
                    if (!this.storeKey) return;
                    const listsStore = lib.listStore(this.storeKey);
                    const part = data[listsStore.key()];
                    if (part !== undefined) {
                        this.gistID = part.id;
                        this.revision = part.revision;
                    }
                },
                true,
            ),
        );
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.cleanup.run();
    }

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    protected render() {
        return html`
            <ui-flex-grid>
                <ui-flex-grid-item direction="column" align="flex-start">
                    <ui-text mono="1" size="0.85rem">${this.gistID || html`???`}</ui-text>
                    <ui-text mono="1" size="0.95rem">
                        <ui-text mono="0" size="0.75rem">REVISION:</ui-text>
                        ${this.revision}
                    </ui-text>
                </ui-flex-grid-item>

                <ui-flex-grid-item>
                    <ui-button
                        variant="full"
                        color="secondary"
                        ?ripple=${this.gistID !== ""}
                        ?disabled=${this.gistID === ""}
                        @click=${async () => {
                            if (!this.storeKey) return;

                            try {
                                this.startSpinner();

                                if (confirm(`Alle Ihre Änderungen gehen verloren!`)) {
                                    await lib.importFromGist(this.storeKey, this.gistID);

                                    const stack = app.PGApp.queryStackLayout()!;
                                    stack.clearStack();
                                }
                            } finally {
                                this.stopSpinner();
                            }
                        }}
                    >
                        Aktualisieren
                    </ui-button>
                </ui-flex-grid-item>
            </ui-flex-grid>

            <ui-spinner
                style="${styles({
                    position: "absolute",
                    top: "0",
                    right: "0",
                    bottom: "0",
                    left: "0",
                    display: "none",
                } as CSSStyleDeclaration)}"
            ></ui-spinner>
        `;
    }
}

export default PGDrawerItemGist;
