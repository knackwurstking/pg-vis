import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { svg, UIDialog, UIDrawerGroupItem, UIInput } from "ui";
import { AlertListsStore } from "../lib/store";

@customElement("pg-drawer-item-import")
class PGDrawerItemImport extends UIDrawerGroupItem {
    @property({ type: String, attribute: "store-key", reflect: true })
    storeKey?:
        | "alertLists"
        | "metalSheets"
        | "vis"
        | "visBookmarks"
        | "visData";

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    protected render() {
        console.debug(`Render component`, this);

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
                    style="display: none;"
                    flex="0"
                >
                    <ui-icon-button
                        style="width: 2.5rem; height: 2.5rem;"
                        ghost
                        ripple
                        @click=${async () => {
                            // TODO: Export here...
                        }}
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
                    @click=${async () => {
                        const input = this.querySelector<UIInput>(
                            `ui-dialog ui-input[name="gistID"]`,
                        )!;

                        const gistID = input.value;
                        if (gistID === "") await this.importFromFile();
                        else await this.importFromGist();
                    }}
                >
                    Submit
                </ui-button>
            </ui-dialog>
        `;
    }

    private dialogTitle(): string {
        let title: string = "";

        switch (this.storeKey) {
            case "alertLists":
                title = "Alarm Listen";
                break;
        }

        return title;
    }

    private async importFromFile() {
        const input = document.createElement("input");

        input.type = "file";
        input.multiple = true;

        /**
         * @param {Event & { currentTarget: HTMLInputElement }} ev
         */
        input.onchange = async () => {
            if (input.files === null) return;

            for (const file of input.files) {
                const reader = new FileReader();
                reader.onload = async () => {
                    if (typeof reader.result !== "string") return;

                    switch (this.storeKey) {
                        case "alertLists":
                            {
                                const listsStore = new AlertListsStore();

                                const data = listsStore.validate(
                                    JSON.parse(reader.result),
                                );
                                if (data === null) {
                                    alert(`Ungültige Daten!`);
                                    return;
                                }

                                listsStore.data = data;
                                listsStore.updateStore();
                            }
                            break;
                    }
                };

                reader.onerror = () => {
                    alert(`Lesen der Datei "${file.name}" ist fehlgeschlagen!`);
                };

                reader.readAsText(file);
            }
        };

        input.click();
    }

    // TODO: Continue here...
    private async importFromGist() {
        if (this.pg.storegistkey === null) {
            throw new Error(`missing "storegistkey"`);
        }

        /**
         * @type {git.Gist<T>}
         */
        const gist = new git.Gist(gistID);
        /**
         * @type {Gist_Data<T>}
         */
        let gistData;

        try {
            gistData = await gist.get();
        } catch (err) {
            // Something went wrong: ${err}
            alert(`Etwas ist schiefgelaufen: ${err}`);
            return;
        }

        // Validate
        try {
            for (const key in gistData.files) {
                gistData.files[key].content = await this.onValidate(
                    gistData.files[key].content,
                );
            }
        } catch (err) {
            // Validation failed: ${err}
            alert(`Validierung fehlgeschlagen: ${err}`);
            return;
        }

        this.uiStore.ui.update("gist", (data) => {
            data[`${this.pg.storegistkey}`] = {
                id: gistID,
                revision: gistData.revision,
            };

            return data;
        });

        // Before Update
        if (typeof this.beforeUpdate === "function") {
            await this.beforeUpdate();
        }

        // Update
        for (const file of Object.values(gistData.files)) {
            await this.onUpdate(file.content);
        }
    }

    //private async export() {
    //    if (this.storeKey === undefined) return;
    //
    //    const store = PGApp.queryStore();
    //
    //    const storeData = store.getData(this.storeKey);
    //    if (storeData === undefined) return;
    //
    //    const zip = new JSZip();
    //
    //    for (let x = 0; x < storeData.length; x++) {
    //        const fileName = `${x}.json`;
    //        zip.file(fileName, JSON.stringify(storeData[x]));
    //    }
    //
    //    const blob = await zip.generateAsync({ type: "blob" });
    //
    //    const fileName = this.getZipFileName();
    //    if (fileName === null)
    //        throw new Error(`unknown store key "${this.storeKey}"`);
    //
    //    FileSaver.saveAs(blob, fileName);
    //}
    //
    //private updateStore(data) {

    //}
}

export default PGDrawerItemImport;
