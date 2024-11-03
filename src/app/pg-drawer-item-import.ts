import FileSaver from "file-saver";
import JSZip from "jszip";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { svg } from "ui";
import { ListsStoreData, newListsStore } from "../lib/lists-store";
import PGApp from "./pg-app";

@customElement("pg-drawer-item-import")
class PGDrawerItemImport extends LitElement {
    @property({ type: String, attribute: "store-key", reflect: true })
    storeKey?: keyof ListsStoreData;

    protected render() {
        return html`
            <ui-flex-grid-row gap="0.25rem">
                <ui-flex-grid-item>
                    <ui-button
                        variant="full"
                        color="primary"
                        ripple
                        @click=${async () => {
                            const dialog = PGApp.queryImportDialog()!;
                            dialog.storeKey = this.storeKey;
                            dialog.show();
                        }}
                    >
                        Import
                    </ui-button>
                </ui-flex-grid-item>

                <ui-flex-grid-item
                    class="flex align-center justify-center"
                    flex="0"
                >
                    <ui-icon-button
                        style="width: 2.5rem; height: 2.5rem;"
                        ghost
                        ripple
                        @click=${async () => await this.export()}
                    >
                        ${svg.smoothieLineIcons.download}
                    </ui-icon-button>
                </ui-flex-grid-item>
            </ui-flex-grid-row>
        `;
    }

    public async export() {
        if (!this.storeKey) return;

        const zip = new JSZip();
        const listsStore = newListsStore(this.storeKey);

        const storeData = PGApp.queryStore().getData(this.storeKey);
        if (storeData === undefined) return;

        for (const list of storeData) {
            const fileName = listsStore.fileName(list);
            zip.file(fileName, JSON.stringify(list, null, 4));
        }

        FileSaver.saveAs(
            await zip.generateAsync({ type: "blob" }),
            listsStore.zipFileName(),
        );
    }
}

export default PGDrawerItemImport;
