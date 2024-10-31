import FileSaver from "file-saver";
import JSZip from "jszip";
import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Octokit } from "octokit";
import { svg, UIDialog, UIDrawerGroupItem, UIInput } from "ui";
import { ListsStoreData, newListsStore } from "../lib/lists-store";
import PGApp from "./pg-app";

@customElement("pg-drawer-item-import")
class PGDrawerItemImport extends UIDrawerGroupItem {
    @property({ type: String, attribute: "store-key", reflect: true })
    storeKey?: keyof ListsStoreData;

    // TODO: Move to lib function "lib/github"
    static async gist(gistID: string) {
        const octokit = new Octokit();
        const resp = await octokit.request("GET /gists/{gist_id}", {
            gist_id: gistID,
            headers: {
                "X-GitHub-Api-Version": "2022-11-28",
            },
        });

        if (resp.status !== 200) {
            console.error(resp);
            throw new Error(
                `anfrage von "GET /gist/${gistID}" ist mit Statuscode ${resp.status} fehlgeschlagen`,
            );
        }

        return resp;
    }

    // TODO: Move to lib function "lib/github"
    static async revision(gistID: string): Promise<number> {
        const octokit = new Octokit();
        const resp = await octokit.request("GET /gists/{gist_id}/commits", {
            gist_id: gistID,
            headers: {
                "X-GitHub-Api-Version": "2022-11-28",
            },
        });

        if (resp.status !== 200) {
            console.error(resp);
            return -1;
        }

        return resp.data.length;
    }

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

    // TODO: Move to lib function "lib/github"
    public async importFromGist(gistID: string) {
        if (!this.storeKey) return;

        try {
            const resp = await PGDrawerItemImport.gist(gistID);

            const listsStore = newListsStore(this.storeKey);

            for (const file of Object.values(resp.data.files || {})) {
                if (!file?.content) continue;

                const data = listsStore.validate(JSON.parse(file.content));
                if (data === null) {
                    throw new Error(
                        `ungültige Daten für "${listsStore.title()}"!`,
                    );
                }

                listsStore.data.push(data);
            }

            const revision = await PGDrawerItemImport.revision(gistID);

            const store = PGApp.queryStore();
            store.setData(this.storeKey, []); // Clear data first

            listsStore.updateStore(true);
            store.updateData("gist", (data) => {
                data[`${this.storeKey}`] = {
                    id: gistID,
                    revision: revision,
                };

                return data;
            });
        } catch (err) {
            // Something went wrong: ${err}
            alert(`Etwas ist schiefgelaufen: ${err}`);
            return;
        }
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
