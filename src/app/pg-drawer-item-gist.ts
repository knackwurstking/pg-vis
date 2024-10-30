import { PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { CleanUp, html, UIDrawerGroupItem } from "ui";
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

    @property({ type: Number, attribute: "revision", reflect: true })
    revision?: number;

    @property({ type: String, attribute: "gist-id", reflect: true })
    gistID?: string;

    protected cleanup = new CleanUp();

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    protected render() {
        return html`
            <ui-flex-grid>
                <ui-flex-grid-item>
                    <ui-text style="display: block;">${this.gistID}</ui-text>
                    <ui-text style="display: block;">
                        revision: ${this.revision}
                    </ui-text>
                </ui-flex-grid-item>

                <ui-flex-grid-item>
                    <ui-button
                        variant="full"
                        color="secondary"
                        ?disabled=${this.gistID === "" ||
                        this.gistID === undefined}
                        @click=${async () => await this.pullFromGist()}
                    >
                        Aktualisieren
                    </ui-button>
                </ui-flex-grid-item>
            </ui-flex-grid>
        `;
    }

    connectedCallback(): void {
        super.connectedCallback();

        const store = PGApp.queryStore();

        this.cleanup.add(
            store.addListener("gist", (data) => {
                const listsStore = this.getListsStore();
                const part = data[listsStore.key()];
                if (part !== undefined) {
                    this.gistID = part.id;
                    this.revision = part.revision;
                }
            }),
        );
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.cleanup.run();
    }

    private async pullFromGist() {
        if (this.gistID === undefined) return;

        const gist = new Gist(this.gistID);
        const listsStore = this.getListsStore();

        try {
            const gistData = await gist.get<any>();

            for (const file of Object.values(gistData.files)) {
                const data = listsStore.validate(file.content);

                if (data === null) {
                    alert(`Ungültige Daten von "${gist.url}"!`);
                    continue;
                }

                listsStore.data.push(data);
            }

            listsStore.updateStore(true);
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
