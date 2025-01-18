import { customElement } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import * as jspdf from "jspdf";
import jsPDFAutotable from "jspdf-autotable";
import { html, PropertyValues, TemplateResult } from "lit";
import { CleanUp, draggable, styles, UIIconButton } from "ui";

import * as app from "@app";
import * as lib from "@lib";
import * as types from "@types";

@customElement("pg-page-content-metal-sheets")
class PGPageContentMetalSheets extends app.PGPageContent<types.MetalSheet> {
    private cleanup = new CleanUp();

    private onEditClick = async () => {
        if (!this.data) return;

        this.openTableDialog({
            format: this.data.format,
            toolID: this.data.toolID,
            press: this.data.data.press,
        });
    };

    private onPrinterClick = async () => {
        if (this.data === undefined) return;

        const pdf = new jspdf.jsPDF();
        const listStore = lib.listStore("metalSheets");

        jsPDFAutotable(pdf, {
            head: [
                [
                    {
                        content: `${listStore.listKey(this.data)}`,
                        colSpan: this.data.data.table.header.length,
                        styles: {
                            fillColor: [255, 255, 255],
                            textColor: [0, 0, 0],
                        },
                    },
                ],
                this.data.data.table.header,
            ],
            body: this.data.data.table.data,
            theme: "grid",
            styles: {
                valign: "middle",
                halign: "center",
                font: "Courier",
                fontStyle: "bold",
                fontSize: 12,
            },
            headStyles: {
                fillColor: [0, 0, 0],
                textColor: [255, 255, 255],
            },
        });

        pdf.save(listStore.fileName(this.data).replace(/(\.json)$/, ".pdf"));
    };

    connectedCallback(): void {
        super.connectedCallback();

        const appBar = app.PGApp.queryAppBar()!;

        // App Bar Event - "edit"

        const editButton = appBar.contentName("edit")!.contentAt<UIIconButton>(0);
        editButton.addEventListener("click", this.onEditClick);
        this.cleanup.add(() => {
            editButton.removeEventListener("click", this.onEditClick);
        });

        // App Bar Event - "printer"

        const printerButton = appBar.contentName("printer")!.contentAt<UIIconButton>(0);
        printerButton.addEventListener("click", this.onPrinterClick);
        this.cleanup.add(() => {
            printerButton.removeEventListener("click", this.onPrinterClick);
        });
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.cleanup.run();
    }

    protected render(): TemplateResult<1> {
        super.renderListsAppBarTitle("metalSheets", this.data);

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
                        const dialog = this.querySelector<app.PGMetalSheetEntryDialog>(
                            `pg-metal-sheet-entry-dialog`,
                        )!;
                        dialog.header = this.data?.data.table.header || [];
                        dialog.tableIndex = -1; // -1 will create a new entry
                        dialog.entryData = [];
                        dialog.show();
                    }}
                >
                    Neuer Eintrag
                </ui-button>
            </ui-flex-grid-row>

            <pg-metal-sheet-entry-dialog
                @submit=${async (ev: Event & { currentTarget: app.PGMetalSheetEntryDialog }) => {
                    if (!this.data) return;

                    if (ev.currentTarget.tableIndex < 0) {
                        this.data.data.table.data.push(ev.currentTarget.entryData);
                    } else {
                        this.data.data.table.data[ev.currentTarget.tableIndex] =
                            ev.currentTarget.entryData;
                    }

                    this.requestUpdate();
                    this.replaceInStore(this.data);
                }}
                @delete=${async (ev: Event & { currentTarget: app.PGMetalSheetEntryDialog }) => {
                    if (!this.data) return;

                    this.data.data.table.data.splice(ev.currentTarget.tableIndex, 1);

                    this.requestUpdate();
                    this.replaceInStore(this.data);
                }}
            ></pg-metal-sheet-entry-dialog>

            <pg-metal-sheet-table-dialog
                class="editList"
                title="Bearbeiten"
                @submit=${(ev: Event & { currentTarget: app.PGMetalSheetTableDialog }) => {
                    if (!this.data) return;

                    const format = ev.currentTarget.format;
                    const toolID = ev.currentTarget.toolID;
                    const press = ev.currentTarget.press;

                    if (!format || !toolID) {
                        setTimeout(() => this.openTableDialog({ format, toolID, press }));
                        return;
                    }

                    const store = app.PGApp.queryStore();
                    const listsStore = lib.listStore("metalSheets");

                    try {
                        const newData: types.MetalSheet = {
                            ...this.data,
                            format: format,
                            toolID: toolID,
                            data: { ...this.data.data, press: press },
                        };

                        listsStore.replaceInStore(store, newData, this.data);
                        this.data = newData;
                    } catch (err) {
                        setTimeout(() => this.openTableDialog({ format, toolID, press }));

                        alert(err);
                        return;
                    }
                }}
            ></pg-metal-sheet-table-dialog>
        `;
    }

    protected updated(_changedProperties: PropertyValues): void {
        const body = this.querySelector(`tbody`)!;
        draggable.createMobile(body, {
            onDragEnd: () => {
                if (!this.data) return;
                this.data.data.table.data = Array.from(body.children).map((child) => {
                    const data = child.getAttribute("data-json");
                    if (!data) throw new Error(`missing attribute "data-json"`);

                    return JSON.parse(data);
                });

                // FIXME: Editing after dragging an item will not correctly rerender the table body
                this.requestUpdate();
                this.replaceInStore(this.data);
            },
        });
    }

    protected firstUpdated(_changedProperties: PropertyValues): void {
        this.classList.add("no-scrollbar");

        this.style.overflow = "hidden";
        this.style.overflowY = "auto";
    }

    private renderTableHeader() {
        if (!this.data) return html``;

        const content: TemplateResult<1>[] = [];
        for (const title of this.data.data.table.header) {
            content.push(html` <th style="text-align: center; text-wrap: pretty;">${title}</th> `);
        }

        return html`${[...content]}`;
    }

    private renderTableBody() {
        if (!this.data) return html``;

        const content: unknown = repeat(
            this.data.data.table.data,
            (data) => `${data.join(",")}`,
            (data, index) => {
                return html`
                    <tr
                        style="cursor: pointer;"
                        role="button"
                        data-json="${JSON.stringify(data)}"
                        @click=${() => {
                            const dialog = this.querySelector<app.PGMetalSheetEntryDialog>(
                                `pg-metal-sheet-entry-dialog`,
                            )!;
                            dialog.header = this.data?.data.table.header || [];
                            dialog.entryData = data;
                            dialog.tableIndex = index;
                            dialog.show();
                        }}
                    >
                        ${[
                            ...data.map(
                                (part) => html` <td style="text-align: center;">${part}</td> `,
                            ),
                        ]}
                    </tr>
                `;
            },
        );

        return html`${content}`;
    }

    private openTableDialog(data: { format: string; toolID: string; press: number }) {
        const dialog = this.querySelector<app.PGMetalSheetTableDialog>(
            `pg-metal-sheet-table-dialog.editList`,
        )!;

        dialog.format = data.format;
        dialog.toolID = data.toolID;
        dialog.press = data.press;

        dialog.show();
    }

    private replaceInStore(list: types.MetalSheet) {
        const listsStore = lib.listStore("metalSheets");
        listsStore.replaceInStore(app.PGApp.queryStore(), list, list);
    }
}

export default PGPageContentMetalSheets;
