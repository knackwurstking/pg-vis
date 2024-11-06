import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";
import { CleanUp, styles, UIIconButton } from "ui";
import { newListsStore } from "../../../lib/lists-store";
import { queryTargetFromElementPath } from "../../../lib/query-utils";
import { VisData } from "../../../store-types";
import PGVisDataDialog from "../../dialogs/pg-vis-data-dialog";
import PGApp from "../../pg-app";
import PGPageContent from "../pg-page-content";
import PGVisDataListItem from "./pg-vis-data-list-item";
import PGPageContentVisDataEdit from "./vis-data-edit/pg-page-content-vis-data-edit";

@customElement("pg-page-content-vis-data")
export class PGPageContentVisData extends PGPageContent<VisData> {
    private cleanup = new CleanUp();

    protected render() {
        PGApp.queryAppBar()!.contentName("title")!.contentAt(0).innerText =
            this.data !== undefined
                ? newListsStore("visData").listKey(this.data)
                : "Vis Data";

        return html`
            <div
                class="container no-scrollbar"
                style="width: 100%; height: 100%; overflow: auto;"
            >
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
                    const content = page.children[0] as
                        | PGPageContentVisDataEdit
                        | undefined;

                    if (content !== undefined) {
                        content.data = {
                            key: null,
                            value: "",
                            lotto: null,
                            format: null,
                            stamp: null,
                            thickness: null,
                        };

                        content.listKey = newListsStore("visData").listKey(
                            this.data!,
                        );

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
            if (!(ev.target instanceof Element) || this.data === undefined)
                return;

            const target = queryTargetFromElementPath<PGVisDataListItem>(
                ev.target,
                "pg-vis-data-list-item",
            );
            if (target === null) return;

            PGApp.queryStackLayout()!.setPage(
                "visDataEdit",
                (page) => {
                    const content = page.children[0] as
                        | PGPageContentVisDataEdit
                        | undefined;

                    if (content !== undefined) {
                        content.data = target.data;

                        content.listKey = newListsStore("visData").listKey(
                            this.data!,
                        );

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
                    style="${styles({
                        width: "100%",
                        height: "100%",
                        overflow: "auto",
                    } as CSSStyleDeclaration)}"
                    @click=${handleClick}
                >
                    ${this.renderData()}
                </div>
            </ui-flex-grid-item>
        `;
    }

    private renderData() {
        if (this.data === undefined) return html``;

        const content = this.data.data.map((entry, index) => {
            return keyed(
                entry,
                html`<pg-vis-data-list-item
                    style="cursor: pointer;"
                    data="${JSON.stringify(entry)}"
                    entry-index=${index}
                    show-filter
                ></pg-vis-data-list-item>`,
            );
        });

        return html`${content}`;
    }

    private renderDialog() {
        const submit = async (
            ev: Event & { currentTarget: PGVisDataDialog },
        ) => {
            if (this.data === undefined) return;

            const oldData = { ...this.data };
            this.data.title = ev.currentTarget.title;

            try {
                newListsStore("visData").replaceInStore(
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

        return html`
            <pg-vis-data-dialog @submit=${submit}></pg-vis-data-dialog>
        `;
    }

    connectedCallback(): void {
        super.connectedCallback();

        // App Bar: "edit"

        const onEditClick = () => {
            if (this.data === undefined) return;

            const dialog =
                this.querySelector<PGVisDataDialog>(`pg-vis-data-dialog`)!;

            dialog.invalidTitle = false;
            dialog.title = this.data.title;

            dialog.show();
        };

        const editButton = PGApp.queryAppBar()!
            .contentName("edit")!
            .contentAt<UIIconButton>(0);

        editButton.addEventListener("click", onEditClick);

        this.cleanup.add(() => {
            editButton.removeEventListener("click", onEditClick);
        });

        // Re-Render if "visData" changes

        const listsStore = newListsStore("visData");
        const store = PGApp.queryStore();
        this.cleanup.add(
            store.addListener("visData", (data) => {
                for (const list of data) {
                    if (
                        listsStore.listKey(list) ===
                        listsStore.listKey(this.data!)
                    ) {
                        this.data = list;
                        return;
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
