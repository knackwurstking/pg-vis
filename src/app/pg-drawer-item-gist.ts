import { customElement, property } from "lit/decorators.js";
import { CleanUp, html, styles, UIDrawerGroupItem, UISpinner } from "ui";
import { ListsStoreData, newListsStore } from "../lib/lists-store";
import PGApp from "./pg-app";
import PGDrawerItemImport from "./pg-drawer-item-import";

@customElement("pg-drawer-item-gist")
class PGDrawerItemGist extends UIDrawerGroupItem {
    @property({ type: String, attribute: "store-key", reflect: true })
    storeKey?: keyof ListsStoreData;

    @property({ type: Number, attribute: false, reflect: true })
    revision: number = 0;

    @property({ type: String, attribute: false, reflect: true })
    gistID: string = "";

    protected cleanup = new CleanUp();

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    protected render() {
        return html`
            <ui-flex-grid>
                <ui-flex-grid-item direction="column" align="flex-start">
                    <ui-text mono="1" size="0.85rem"
                        >${this.gistID || html`???`}</ui-text
                    >
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
                            try {
                                this.startSpinner();

                                // TODO: Detect changes and only trigger a
                                //       confirmation dialog if needed
                                if (
                                    confirm(
                                        `Alle Ihre Änderungen gehen verloren!`,
                                    )
                                ) {
                                    const importItem = new PGDrawerItemImport();
                                    importItem.storeKey = this.storeKey;
                                    importItem.importFromGist(this.gistID);
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

    connectedCallback(): void {
        super.connectedCallback();

        const store = PGApp.queryStore();

        this.cleanup.add(
            store.addListener(
                "gist",
                (data) => {
                    if (!this.storeKey) return;
                    const listsStore = newListsStore(this.storeKey);
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

    public startSpinner() {
        this.querySelector<UISpinner>("ui-spinner")!.style.display = "block";
    }

    public stopSpinner() {
        this.querySelector<UISpinner>("ui-spinner")!.style.display = "none";
    }
}

export default PGDrawerItemGist;
