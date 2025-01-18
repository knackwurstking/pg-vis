import { DirectiveResult } from "lit/async-directive.js";
import { customElement, property, state } from "lit/decorators.js";
import { Keyed, keyed } from "lit/directives/keyed.js";

import { html, PropertyValues } from "lit";
import { CleanUp, UIIconButton } from "ui";

import * as app from "@app";
import * as lib from "@lib";
import * as types from "@types";

@customElement("pg-page-content-vis-data")
export class PGPageContentVisData extends app.PGPageContent<types.VisData> {
    @property({ type: Boolean, attribute: "search-bar", reflect: true })
    searchBar?: boolean;

    @state()
    private filter?: RegExp;

    @state()
    private listItems: DirectiveResult<typeof Keyed>[] = [];

    private cleanup = new CleanUp();

    connectedCallback(): void {
        super.connectedCallback();

        const appBar = app.PGApp.queryAppBar()!;

        // App Bar Events

        const onClick = async () => (this.searchBar = !this.searchBar);
        const appBarSearchButton = appBar.contentName("search")!.contentAt<UIIconButton>(0);

        appBarSearchButton.addEventListener("click", onClick);
        this.cleanup.add(() => appBarSearchButton.removeEventListener("click", onClick));

        // App Bar: "edit"

        const onEditClick = () => {
            if (this.data === undefined) return;

            const dialog = this.querySelector<app.PGVisDataDialog>(`pg-vis-data-dialog.editList`)!;

            dialog.invalidTitle = false;
            dialog.title = this.data.title;

            dialog.show();
        };

        const editButton = appBar.contentName("edit")!.contentAt<UIIconButton>(0);

        editButton.addEventListener("click", onEditClick);
        this.cleanup.add(() => {
            editButton.removeEventListener("click", onEditClick);
        });

        // Re-Render if "visData" store changes

        const listsStore = lib.listStore("visData");
        const store = app.PGApp.queryStore();

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

    protected render() {
        super.renderListsAppBarTitle("visData", this.data);

        return html`
            <pg-search-bar
                title="Filter"
                storage-key="${this.data?.title}"
                ?active=${!!this.searchBar}
                @change=${async (ev: Event & { currentTarget: app.PGSearchBar }) => {
                    this.filter = app.PGSearchBar.generateRegExp(ev.currentTarget.value());
                }}
            ></pg-search-bar>

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

    protected updated(changedProperties: PropertyValues): void {
        if (changedProperties.has("data") || changedProperties.has("filter")) {
            setTimeout(() => this.updateContent());
        }

        const pgSearchBar = this.querySelector<app.PGSearchBar>(`pg-search-bar`)!;
        const container = this.querySelector<HTMLElement>(`div.container`)!;

        setTimeout(() => {
            if (this.searchBar) {
                container.style.paddingTop = `calc(${pgSearchBar.clientHeight}px + var(--ui-spacing) * 2)`;

                const filter = app.PGSearchBar.generateRegExp(pgSearchBar.value());
                if (this.filter?.toString() !== filter.toString()) {
                    this.filter = app.PGSearchBar.generateRegExp(pgSearchBar.value());
                }
            } else {
                container.style.paddingTop = `0`;

                if (this.filter !== undefined) {
                    this.filter = undefined;
                }
            }
        });
    }

    private renderActions() {
        const newEntry = async () => {
            app.PGApp.queryStackLayout()!.setPage(
                "visDataEdit",
                (page) => {
                    const content = page.children[0] as app.PGPageContentVisDataEdit | undefined;

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
        const submit = async (ev: Event & { currentTarget: app.PGVisDataDialog }) => {
            if (this.data === undefined) return;

            const oldData = { ...this.data };
            this.data.title = ev.currentTarget.title;

            try {
                lib.listStore("visData").replaceInStore(
                    app.PGApp.queryStore(),
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

        return html` <pg-vis-data-dialog class="editList" @submit=${submit}></pg-vis-data-dialog> `;
    }

    private updateContent() {
        this.listItems = [];
        if (this.data === undefined) return;

        const newListItems = [];
        const listsStore = lib.listStore("visData");

        let index = -1;
        for (const entry of this.data.data) {
            index++;

            if (this.searchBar && this.filter !== undefined) {
                const searchString = `${entry.key || ""} ${entry.lotto || ""},${
                    entry.format || ""
                },${entry.stamp || ""},${
                    entry.thickness?.replace(/[0-9]+/g, "$&mm") || ""
                } ${entry.value}`;

                if (!this.filter.test(searchString)) {
                    continue;
                }
            }

            newListItems.push(
                keyed(
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
                ),
            );
        }

        this.listItems = newListItems;
    }
}

export default PGPageContentVisData;
