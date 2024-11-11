import { html, PropertyValues } from "lit";
import { customElement } from "lit/decorators.js";
import { DirectiveResult } from "lit/directive.js";
import { Keyed, keyed } from "lit/directives/keyed.js";
import { CleanUp, UIIconButton } from "ui";

import { PGPageContentVisDataEdit, PGVisDataListItem } from ".";
import * as lib from "../../../lib";
import { VisData } from "../../../store-types";
import { PGVisDataDialog } from "../../dialogs";
import PGApp from "../../pg-app";
import PGPageContent from "../pg-page-content";

@customElement("pg-page-content-vis-data")
export class PGPageContentVisData extends PGPageContent<VisData> {
    private cleanup = new CleanUp();
    private content: DirectiveResult<typeof Keyed>[] = [];

    protected render() {
        PGApp.queryAppBar()!.contentName("title")!.contentAt(0).innerText =
            this.data !== undefined
                ? lib.listsStore("visData").listKey(this.data)
                : lib.listsStore("visData").title();

        return html`
            <div class="container no-scrollbar" style="width: 100%; height: 100%; overflow: auto;">
                <ui-flex-grid gap="0.25rem">
                    ${this.renderActions()} ${this.renderContent()}
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

                        content.listKey = lib.listsStore("visData").listKey(this.data!);

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

    private renderContent() {
        const handleClick = async (ev: Event) => {
            if (!(ev.target instanceof Element) || this.data === undefined) return;

            const target = lib.queryTargetFromElementPath<PGVisDataListItem>(
                ev.target,
                "pg-vis-data-list-item",
            );
            if (target === null) return;

            PGApp.queryStackLayout()!.setPage(
                "visDataEdit",
                (page) => {
                    const content = page.children[0] as PGPageContentVisDataEdit | undefined;

                    if (content !== undefined) {
                        content.data = target.data;

                        content.listKey = lib.listsStore("visData").listKey(this.data!);

                        content.entryIndex = target.entryIndex;
                    }
                },
                true,
            );
        };

        return html`
            <ui-flex-grid-item>
                <div
                    class="list no-scrollbar"
                    style="width: 100%; height: 100%; overflow: auto;"
                    @click=${handleClick}
                >
                    ${this.content}
                </div>
            </ui-flex-grid-item>
        `;
    }

    private renderDialog() {
        const submit = async (ev: Event & { currentTarget: PGVisDataDialog }) => {
            if (this.data === undefined) return;

            const oldData = { ...this.data };
            this.data.title = ev.currentTarget.title;

            try {
                lib.listsStore("visData").replaceInStore(
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
            setTimeout(() => {
                this.content = [];
                (this.data?.data || []).forEach(async (entry, index) => {
                    setTimeout(() => {
                        this.content.push(
                            keyed(
                                entry,
                                html`<pg-vis-data-list-item
                                    style="cursor: pointer;"
                                    data="${JSON.stringify(entry)}"
                                    entry-index=${index}
                                    show-filter
                                ></pg-vis-data-list-item>`,
                            ),
                        );
                    });
                });

                setTimeout(() => this.requestUpdate());
            });
        }
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

        // Re-Render if "visData" changes

        const listsStore = lib.listsStore("visData");
        const store = PGApp.queryStore();
        this.cleanup.add(
            store.addListener("visData", (data) => {
                for (const list of data) {
                    if (listsStore.listKey(list) === listsStore.listKey(this.data!)) {
                        this.data = list;
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
