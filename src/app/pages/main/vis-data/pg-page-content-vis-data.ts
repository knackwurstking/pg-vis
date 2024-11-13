import { html, PropertyValues } from "lit";
import { customElement, state } from "lit/decorators.js";
import { CleanUp, UIIconButton } from "ui";

import * as lib from "../../../../lib";
import * as types from "../../../../types";

import { DirectiveResult } from "lit/async-directive.js";
import { Keyed, keyed } from "lit/directives/keyed.js";
import { PGVisDataDialog } from "../../../dialogs";
import PGApp from "../../../pg-app";
import PGPageContent from "../../pg-page-content";
import { PGPageContentVisDataEdit } from "../../sub";

@customElement("pg-page-content-vis-data")
export class PGPageContentVisData extends PGPageContent<types.VisData> {
    @state()
    private listItems: DirectiveResult<typeof Keyed>[] = [];

    private cleanup = new CleanUp();

    protected render() {
        PGApp.queryAppBar()!.contentName("title")!.contentAt(0).innerText =
            this.data !== undefined
                ? lib.listStore("visData").listKey(this.data)
                : lib.listStore("visData").title();

        return html`
            <div class="container no-scrollbar" style="width: 100%; height: 100%; overflow: auto;">
                <ui-flex-grid gap="0.25rem">
                    ${this.renderActions()}

                    <ui-flex-grid-item>
                        <div
                            class="list no-scrollbar"
                            style="width: 100%; height: 100%; overflow: auto;"
                        >
                            ${this.listItems}
                        </div>
                    </ui-flex-grid-item>
                </ui-flex-grid>
            </div>

            ${this.renderDialog()}
        `;
    }

    private renderActions() {
        const newEntry = async () => {
            PGApp.queryStackLayout()!.setPage(
                "visDataEdit",
                (page) => {
                    const content = page.children[0] as PGPageContentVisDataEdit | undefined;

                    if (content !== undefined) {
                        content.data = {
                            key: null,
                            value: "",
                            lotto: null,
                            format: null,
                            stamp: null,
                            thickness: null,
                        };

                        content.listKey = lib.listStore("visData").listKey(this.data!);

                        content.entryIndex = -1;
                    }
                },
                true,
            );
        };

        return html`
            <ui-flex-grid-row justify="flex-end" gap="0.25rem">
                <ui-flex-grid-item flex="0">
                    <ui-button
                        name="new-entry"
                        style="text-wrap: nowrap;"
                        variant="full"
                        color="primary"
                        @click=${newEntry}
                    >
                        Neuer Eintrag
                    </ui-button>
                </ui-flex-grid-item>
            </ui-flex-grid-row>
        `;
    }

    private renderDialog() {
        const submit = async (ev: Event & { currentTarget: PGVisDataDialog }) => {
            if (this.data === undefined) return;

            const oldData = { ...this.data };
            this.data.title = ev.currentTarget.title;

            try {
                lib.listStore("visData").replaceInStore(
                    PGApp.queryStore(),
                    { ...this.data },
                    oldData,
                );
            } catch (err) {
                alert(err);
                setTimeout(() => {
                    const dialog = ev.currentTarget;
                    dialog.invalidTitle = true;
                    dialog.show();
                });
            }
        };

        return html` <pg-vis-data-dialog @submit=${submit}></pg-vis-data-dialog> `;
    }

    protected updated(changedProperties: PropertyValues): void {
        if (changedProperties.has("data")) {
            setTimeout(() => this.updateContent());
        }
    }

    private updateContent() {
        this.listItems = [];
        if (this.data === undefined) return;

        const listsStore = lib.listStore("visData");
        this.listItems = this.data.data.map((entry, index) => {
            return keyed(
                entry,
                html`
                    <pg-vis-data-list-item
                        data=${JSON.stringify(entry)}
                        list-key=${this.data !== undefined ? listsStore.listKey(this.data) : ""}
                        entry-index=${index}
                        show-filter
                        route
                    >
                    </pg-vis-data-list-item>
                `,
            );
        });
    }

    connectedCallback(): void {
        super.connectedCallback();

        // App Bar: "edit"

        const onEditClick = () => {
            if (this.data === undefined) return;

            const dialog = this.querySelector<PGVisDataDialog>(`pg-vis-data-dialog`)!;

            dialog.invalidTitle = false;
            dialog.title = this.data.title;

            dialog.show();
        };

        const editButton = PGApp.queryAppBar()!.contentName("edit")!.contentAt<UIIconButton>(0);

        editButton.addEventListener("click", onEditClick);

        this.cleanup.add(() => {
            editButton.removeEventListener("click", onEditClick);
        });

        // Re-Render if "visData" store changes

        const listsStore = lib.listStore("visData");
        const store = PGApp.queryStore();

        this.cleanup.add(
            store.addListener("visData", (data) => {
                if (this.data === undefined) return;

                const listKey = listsStore.listKey(this.data);

                for (const list of data) {
                    if (listsStore.listKey(list) === listKey) {
                        this.data = list;
                        break;
                    }
                }
            }),
        );
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.cleanup.run();
    }
}

export default PGPageContentVisData;
