import "./pg-metal-sheet-entry-dialog"; // Register component

import { html, PropertyValues, TemplateResult } from "lit";
import { DirectiveResult } from "lit/async-directive.js";
import { customElement } from "lit/decorators.js";
import { Keyed, keyed } from "lit/directives/keyed.js";
import { CleanUp, draggable, styles, UIIconButton } from "ui";
import { newListsStore } from "../../../lib/lists-store";
import { MetalSheet } from "../../../store-types";
import PGMetalSheetTableDialog from "../../dialogs/pg-metal-sheet-table-dialog";
import PGApp from "../../pg-app";
import PGPageContent from "../pg-page-content";
import PGMetalSheetEntryDialog from "./pg-metal-sheet-entry-dialog";

@customElement("pg-page-content-metal-sheets")
class PGPageContentMetalSheets extends PGPageContent<MetalSheet> {
    private cleanup = new CleanUp();

    protected render(): TemplateResult<1> {
        PGApp.queryAppBar()!.contentName("title")!.contentAt(0).innerText =
            this.data !== undefined
                ? newListsStore("metalSheets")
                      .fileName(this.data)
                      .split(".")
                      .slice(0, -1)
                      .join(".")
                : "Bleck Liste";

        return html`
            <div
                class="no-scrollbar"
                style="${styles({
                    width: "100%",
                    overflowX: "auto",
                } as CSSStyleDeclaration)}"
            >
                <table>
                    <thead>
                        <tr>
                            ${this.renderTableHeader()}
                        </tr>
                    </thead>
                    <tbody>
                        ${this.renderTableBody()}
                    </tbody>
                </table>
            </div>

            <br />

            <ui-flex-grid-row class="actions">
                <ui-button
                    variant="full"
                    color="primary"
                    ripple
                    @click=${() => {
                        const dialog =
                            this.querySelector<PGMetalSheetEntryDialog>(
                                `pg-metal-sheet-entry-dialog`,
                            )!;
                        dialog.header = this.data?.data.table.header || [];
                        dialog.tableIndex = -1; // NOTE: -1 will create a new entry
                        dialog.entryData = [];
                        dialog.show();
                    }}
                >
                    Neuer Eintrag
                </ui-button>
            </ui-flex-grid-row>

            <pg-metal-sheet-entry-dialog
                @submit=${async (
                    ev: Event & { currentTarget: PGMetalSheetEntryDialog },
                ) => {
                    if (!this.data) return;

                    if (ev.currentTarget.tableIndex < 0) {
                        this.data.data.table.data.push(
                            ev.currentTarget.entryData,
                        );
                    } else {
                        this.data.data.table.data[ev.currentTarget.tableIndex] =
                            ev.currentTarget.entryData;
                    }

                    this.requestUpdate();
                    this.storeTable(this.data);
                }}
                @delete=${async (
                    ev: Event & { currentTarget: PGMetalSheetEntryDialog },
                ) => {
                    if (!this.data) return;

                    this.data.data.table.data.splice(
                        ev.currentTarget.tableIndex,
                        1,
                    );

                    this.requestUpdate();
                    this.storeTable(this.data);
                }}
            ></pg-metal-sheet-entry-dialog>

            <pg-metal-sheet-table-dialog
                title="Liste Bearbeiten"
                @submit=${(
                    ev: Event & { currentTarget: PGMetalSheetTableDialog },
                ) => {
                    const format = ev.currentTarget.format;
                    const toolID = ev.currentTarget.toolID;
                    const press = ev.currentTarget.press;

                    const store = PGApp.queryStore();

                    if (!this.data) return;
                    const listsStore = newListsStore("metalSheets");

                    const oldListKey = listsStore.listKey(this.data);
                    const newListKey = listsStore.listKey({
                        ...this.data,
                        format: format,
                        toolID: toolID,
                        data: { ...this.data.data, press: press },
                    });

                    if (oldListKey !== newListKey) {
                        for (const list of store.getData("metalSheets") || []) {
                            if (listsStore.listKey(list) === newListKey) {
                                setTimeout(() => this.openTableDialog());
                                alert(
                                    `Liste "${newListKey}" existiert bereits!"`,
                                );
                                return;
                            }
                        }
                    }

                    store.updateData("metalSheets", (data) => {
                        if (!this.data) return data;

                        for (const metalSheet of data) {
                            if (listsStore.listKey(metalSheet) === oldListKey) {
                                metalSheet.format = format;
                                metalSheet.toolID = toolID;
                                metalSheet.data.press = press;

                                this.data = metalSheet;
                            }
                        }

                        return data;
                    });
                }}
            ></pg-metal-sheet-table-dialog>
        `;
    }

    private renderTableHeader() {
        if (!this.data) return html``;

        const content: TemplateResult<1>[] = [];
        for (const title of this.data.data.table.header) {
            content.push(html`
                <th style="text-align: center; text-wrap: pretty;">${title}</th>
            `);
        }

        return html`${[...content]}`;
    }

    private renderTableBody() {
        if (!this.data) return html``;

        const content: DirectiveResult<typeof Keyed>[] = [];
        for (let i = 0; i < this.data.data.table.data.length; i++) {
            const data = this.data.data.table.data[i];

            content.push(
                keyed(
                    data,
                    html`
                        <tr
                            style="cursor: pointer;"
                            role="button"
                            data-json="${JSON.stringify(data)}"
                            @click=${() => {
                                const dialog =
                                    this.querySelector<PGMetalSheetEntryDialog>(
                                        `pg-metal-sheet-entry-dialog`,
                                    )!;
                                dialog.header =
                                    this.data?.data.table.header || [];
                                dialog.entryData = data;
                                dialog.tableIndex = i;
                                dialog.show();
                            }}
                        >
                            ${[
                                ...data.map(
                                    (part) => html`
                                        <td style="text-align: center;">
                                            ${part}
                                        </td>
                                    `,
                                ),
                            ]}
                        </tr>
                    `,
                ),
            );
        }

        return html`${[...content]}`;
    }

    protected updated(_changedProperties: PropertyValues): void {
        const body = this.querySelector(`tbody`)!;
        draggable.createMobile(body, {
            onDragEnd: () => {
                if (!this.data) return;
                this.data.data.table.data = Array.from(body.children).map(
                    (child) => {
                        const data = child.getAttribute("data-json");
                        if (!data)
                            throw new Error(`missing attribute "data-json"`);

                        return JSON.parse(data);
                    },
                );

                this.requestUpdate();
                this.storeTable(this.data);
            },
        });
    }

    protected firstUpdated(_changedProperties: PropertyValues): void {
        this.classList.add("no-scrollbar");

        this.style.overflow = "hidden";
        this.style.overflowY = "auto";
    }

    connectedCallback(): void {
        super.connectedCallback();

        // App Bar Events
        const onClick = async () => this.openTableDialog();

        const editButton = PGApp.queryAppBar()!
            .contentName("edit")!
            .contentAt<UIIconButton>(0);

        editButton.addEventListener("click", onClick);

        this.cleanup.add(() => {
            editButton.removeEventListener("click", onClick);
        });
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.cleanup.run();
    }

    protected openTableDialog() {
        if (!this.data) return;

        const dialog = this.querySelector<PGMetalSheetTableDialog>(
            `pg-metal-sheet-table-dialog`,
        )!;

        dialog.format = this.data.format;
        dialog.toolID = this.data.toolID;
        dialog.press = this.data.data.press;

        dialog.show();
    }

    protected storeTable(list: MetalSheet) {
        const store = PGApp.queryStore();

        const listsStore = newListsStore("metalSheets");
        const listKey = listsStore.listKey(list);

        store.updateData("metalSheets", (data) => {
            return data.map((dataList) =>
                listsStore.listKey(dataList) === listKey ? list : dataList,
            );
        });
    }
}
export default PGPageContentMetalSheets;
