import FileSaver from "file-saver";
import JSZip from "jszip";
import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { svg, UIDialog, UIDrawerGroupItem, UIInput } from "ui";
import { importFromGist } from "../lib/gist";
import { ListsStoreData, newListsStore } from "../lib/lists-store";
import PGApp from "./pg-app";

@customElement("pg-drawer-item-import")
class PGDrawerItemImport extends UIDrawerGroupItem {
    @property({ type: String, attribute: "store-key", reflect: true })
    storeKey?: keyof ListsStoreData;

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    protected render() {
        return html`
            <ui-flex-grid-row gap="0.25rem">
                <ui-flex-grid-item>
                    <ui-button
                        variant="full"
                        color="primary"
                        ripple
                        @click=${async () => {
                            const dialog = document.querySelector<UIDialog>(
                                `ui-dialog[name="import"]`,
                            )!;

                            dialog.title = `Import "${this.dialogTitle()}"`;
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

            <ui-dialog name="import" title="Import" modal inert>
                <ui-flex-grid gap="0.5rem">
                    <ui-flex-grid-item>
                        <ui-label
                            secondary="Zum Importieren einer Datei leer lassen"
                        ></ui-label>
                    </ui-flex-grid-item>

                    <ui-flex-grid-item>
                        <ui-input
                            name="gistID"
                            type="text"
                            title="Gist ID"
                        ></ui-input>
                    </ui-flex-grid-item>
                </ui-flex-grid>

                <ui-button
                    slot="actions"
                    variant="full"
                    color="secondary"
                    @click=${async () => {
                        const dialog = this.querySelector<UIDialog>(
                            `ui-dialog[name="import"]`,
                        )!;
                        dialog.close();
                    }}
                >
                    Cancel
                </ui-button>

                <ui-button
                    slot="actions"
                    variant="full"
                    color="primary"
                    @click=${async () => {
                        if (!this.storeKey) return;

                        const gistID = this.querySelector<UIInput>(
                            `ui-dialog ui-input[name="gistID"]`,
                        )!.value;

                        if (gistID === "") await this.importFromFile();
                        else await importFromGist(this.storeKey, gistID);

                        this.querySelector<UIDialog>(
                            `ui-dialog[name="import"]`,
                        )!.close();
                    }}
                >
                    Submit
                </ui-button>
            </ui-dialog>
        `;
    }

    private dialogTitle(): string {
        if (!this.storeKey) return "";
        return newListsStore(this.storeKey).title();
    }

    public async importFromFile() {
        if (!this.storeKey) return;

        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.onchange = async () => {
            if (input.files === null) return;

            for (const file of input.files) {
                const reader = new FileReader();
                reader.onload = async () => {
                    if (typeof reader.result !== "string") return;
                    if (this.storeKey === undefined) return;

                    const listsStore = newListsStore(this.storeKey);
                    const data = listsStore.validate(JSON.parse(reader.result));
                    if (data === null) {
                        alert(`Ungültige Daten für "${listsStore.title()}"!`);
                        return;
                    }

                    listsStore.data.push(data);
                    listsStore.updateStore(true);
                };

                reader.onerror = () => {
                    alert(`Lesen der Datei "${file.name}" ist fehlgeschlagen!`);
                };

                reader.readAsText(file);
            }
        };

        input.click();
    }

    public async export() {
        if (!this.storeKey) return;

        const zip = new JSZip();
        const listsStore = newListsStore(this.storeKey);

        const storeData = PGApp.queryStore().getData(this.storeKey);
        if (storeData === undefined) return;
        listsStore.data = storeData;

        for (const list of listsStore.data) {
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
