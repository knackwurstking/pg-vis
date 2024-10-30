import FileSaver from "file-saver";
import JSZip from "jszip";
import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { svg, UIDialog, UIDrawerGroupItem, UIInput } from "ui";
import { Gist, GistData } from "../lib/gist";
import {
    AlertListsStore,
    ListsStore,
    ListsStoreData,
} from "../lib/lists-store";
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
                        const input = this.querySelector<UIInput>(
                            `ui-dialog ui-input[name="gistID"]`,
                        )!;

                        const gistID = input.value;
                        if (gistID === "") await this.importFromFile();
                        else await this.importFromGist(gistID);

                        const dialog = this.querySelector<UIDialog>(
                            `ui-dialog[name="import"]`,
                        )!;
                        dialog.close();
                    }}
                >
                    Submit
                </ui-button>
            </ui-dialog>
        `;
    }

    private dialogTitle(): string {
        let listsStore = this.getListsStore();
        return listsStore.title();
    }

    private async importFromFile() {
        if (this.storeKey === undefined) return;

        const input = document.createElement("input");

        input.type = "file";
        input.multiple = true;

        input.onchange = async () => {
            if (input.files === null) return;

            for (const file of input.files) {
                const reader = new FileReader();
                reader.onload = async () => {
                    if (typeof reader.result !== "string") return;

                    let listsStore = this.getListsStore();

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

    private async importFromGist(gistID: string) {
        if (this.storeKey === undefined) return;

        const gist = new Gist(gistID);

        let gistData: GistData<any>;

        try {
            gistData = await gist.get<any>();
        } catch (err) {
            // Something went wrong: ${err}
            alert(`Etwas ist schiefgelaufen: ${err}`);
            return;
        }

        const store = PGApp.queryStore();
        let revision: number = 0;

        let listsStore = this.getListsStore();

        for (const file of Object.values(gistData.files)) {
            const data = listsStore.validate(file.content);
            if (data === null) {
                alert(`Ungültige Daten für "${listsStore.title}"!`);
                return;
            }

            gistData.files[file.filename].content = data;
        }

        store.setData(this.storeKey, []); // Clear data first
        listsStore.updateStore(true);

        store.updateData("gist", (data) => {
            data[`${this.storeKey}`] = {
                id: gistID,
                revision: revision,
            };

            return data;
        });
    }

    private async export() {
        if (this.storeKey === undefined) return;

        const zip = new JSZip();
        const store = PGApp.queryStore();

        let listsStore = this.getListsStore();

        const storeData = store.getData(this.storeKey);
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

    private getListsStore(): ListsStore<any> {
        switch (this.storeKey) {
            case "alertLists":
                return new AlertListsStore();
            default:
                throw new Error(`unknown "${this.storeKey}"`);
        }
    }
}

export default PGDrawerItemImport;
