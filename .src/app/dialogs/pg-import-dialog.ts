import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";
import { UIDialog, UIInput } from "ui";

import * as app from "@app";
import * as lib from "@lib";

@customElement("pg-import-dialog")
class PGImportDialog extends LitElement {
    @property({ type: String, attribute: "store-key", reflect: true })
    storeKey?: keyof lib.listStores.ListStoreData;

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

                    const listsStore = lib.listStore(this.storeKey);

                    let data: any;
                    try {
                        data = listsStore.validate(reader.result);
                    } catch (err) {
                        alert(err);
                        return;
                    }

                    if (data === null) {
                        alert(`Ungültige Daten für "${listsStore.title()}"!`);
                        return;
                    }

                    try {
                        listsStore.addToStore(app.PGApp.queryStore(), [data], true);
                    } catch (err) {
                        alert(err);
                        return;
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

    public show() {
        this.querySelector<UIDialog>("ui-dialog")!.show();
    }

    public close() {
        this.querySelector<UIDialog>("ui-dialog")!.close();
    }

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    protected render(): TemplateResult<1> {
        return html`
            <ui-dialog title="Import" modal inert>
                <ui-flex-grid gap="0.5rem">
                    <ui-flex-grid-item>
                        <ui-label
                            secondary="Zum Importieren von einer Datei leer lassen"
                        ></ui-label>
                    </ui-flex-grid-item>

                    <ui-flex-grid-item>
                        ${keyed(
                            this.storeKey,
                            html` <ui-input name="gistID" type="text" title="Gist ID"></ui-input> `,
                        )}
                    </ui-flex-grid-item>
                </ui-flex-grid>

                <ui-button
                    slot="actions"
                    variant="full"
                    color="secondary"
                    @click=${async () => this.close()}
                >
                    Abbrechen
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
                        else await lib.importFromGist(this.storeKey, gistID);

                        const stack = app.PGApp.queryStackLayout()!;
                        stack.clearStack();

                        this.close();
                    }}
                >
                    OK
                </ui-button>
            </ui-dialog>
        `;
    }
}

export default PGImportDialog;
