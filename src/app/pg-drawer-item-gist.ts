import { customElement, property } from "lit/decorators.js";
import { CleanUp, html, styles, UIDrawerGroupItem } from "ui";
import { Gist } from "../lib/gist";
import {
    AlertListsStore,
    ListsStore,
    ListsStoreData,
} from "../lib/lists-store";
import PGApp from "./pg-app";

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
                <ui-flex-grid-item direction="column" align="center">
                    <ui-text>${this.gistID || html`???`}</ui-text>
                    <ui-text> revision: ${this.revision} </ui-text>
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
                                await this.pullFromGist();
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
                    const listsStore = this.getListsStore();
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
        // TODO: ...
    }

    public stopSpinner() {
        // TODO: ...
    }

    public async pullFromGist() {
        if (this.gistID === "") return;

        try {
            const gist = new Gist(this.gistID);
            const gistData = await gist.get<any>();

            const listsStore = this.getListsStore();
            for (const file of Object.values(gistData.files)) {
                const data = listsStore.validate(file.content);

                if (data === null) {
                    alert(`Ungültige Daten von "${gist.url}"!`);
                    continue;
                }

                listsStore.data.push(data);
            }

            listsStore.updateStore(true);

            PGApp.queryStore().updateData("gist", (data) => {
                data[listsStore.key()] = {
                    id: this.gistID,
                    revision: gistData.revision,
                };
                return data;
            });
        } catch (err) {
            alert(err);
        }
    }

    private getListsStore(): ListsStore<any> {
        switch (this.storeKey) {
            case "alertLists":
                return new AlertListsStore();
            default:
                throw new Error(`unknown "${this.storeKey}"`);
        }
    }
}

export default PGDrawerItemGist;
