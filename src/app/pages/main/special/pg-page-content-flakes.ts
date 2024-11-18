import { customElement, property, state } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";
import { repeat } from "lit/directives/repeat.js";

import * as jspdf from "jspdf";
import jsPDFAutotable from "jspdf-autotable";
import { html, LitElement, PropertyValues } from "lit";
import { CleanUp, UIIconButton } from "ui";

import * as app from "@app";
import * as lib from "@lib";
import * as types from "@types";

@customElement("pg-page-content-flakes")
class PGPageContentFlakes extends LitElement {
    @property({ type: Object, attribute: "data", reflect: true })
    data?: types.FlakesSpecial;

    @property({ type: Boolean, attribute: "search-bar", reflect: true })
    searchBar?: boolean;

    @state()
    private flakesFilter?: RegExp;

    private record: Record<types.PressSlot, types.FlakesEntry[]> = {
        P0: [],
        P4: [],
        P5: [],
    };

    private cleanup = new CleanUp();

    private towerSlots: types.TowerSlot[] = ["A", "C", "E", "G", "I", "K"];

    private pressConvert: Record<types.PressSlot, string> = {
        P0: "Presse 0",
        P4: "Presse 4",
        P5: "Presse 5",
    };

    private onSearchClick = async () => (this.searchBar = !this.searchBar);

    private onPrinterClick = async () => {
        if (this.data === undefined) return;

        const pdf = new jspdf.jsPDF();
        const listStore = lib.listStore("special");

        const createTable = (press: types.PressSlot, entries: types.FlakesEntry[]) => {
            const bodyData = [];
            for (const entry of entries) {
                const slots = [
                    entry.compatatore,
                    `${entry.primary.percent}%\n${entry.primary.value}`,
                    ``,
                    ``,
                    ``,
                    ``,
                    ``,
                    ``,
                ];

                for (const consumption of entry.secondary) {
                    slots[this.towerSlots.indexOf(consumption.slot) + 2] =
                        `${consumption.percent}%\n${consumption.value}`;
                }

                bodyData.push(slots);
            }

            jsPDFAutotable(pdf, {
                head: [
                    [
                        {
                            content: `${listStore.listKey(this.data!)} - ${this.pressConvert[press]}`,
                            colSpan: this.towerSlots.length + 2, // + "C1" + "Main"
                            styles: {
                                fillColor: [255, 255, 255],
                                textColor: [0, 0, 0],
                            },
                        },
                    ],
                    ["C1", "Main", ...this.towerSlots],
                ],
                body: bodyData,
                theme: "grid",
                styles: {
                    valign: "middle",
                    halign: "center",
                    font: "Courier",
                    fontSize: 12,
                },
                headStyles: {
                    fillColor: [0, 0, 0],
                    textColor: [255, 255, 255],
                },
            });
        };

        for (const [k, v] of Object.entries(this.record)) {
            createTable(k as types.PressSlot, v);
        }

        pdf.save(listStore.fileName(this.data).replace(/(\.json)$/, ".pdf"));
    };

    connectedCallback(): void {
        super.connectedCallback();

        const appBar = app.PGApp.queryAppBar()!;

        // App Bar Events - "search"

        const searchButton = appBar.contentName("search")!.contentAt<UIIconButton>(0);
        searchButton.addEventListener("click", this.onSearchClick);
        this.cleanup.add(() => searchButton.removeEventListener("click", this.onSearchClick));

        // App Bar Events - "printer"

        const printerButton = appBar.contentName("printer")!.contentAt<UIIconButton>(0);
        printerButton.addEventListener("click", this.onPrinterClick);
        this.cleanup.add(() => printerButton.removeEventListener("click", this.onPrinterClick));
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.cleanup.run();
    }

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    protected render() {
        if (this.data === undefined) return html``;
        return this.renderFlakes(this.data.data);
    }

    protected updated(_changedProperties: PropertyValues): void {
        const pgSearchBar = this.querySelector<app.PGSearchBar>(`pg-search-bar`)!;
        const container = this.querySelector<HTMLElement>(`div.container`)!;

        setTimeout(() => {
            if (this.searchBar) {
                container.style.paddingTop = `calc(${pgSearchBar.clientHeight}px + var(--ui-spacing) * 2)`;
                const filter = app.PGSearchBar.generateRegExp(pgSearchBar.value());
                if (this.flakesFilter?.toString() !== filter.toString()) {
                    this.flakesFilter = app.PGSearchBar.generateRegExp(pgSearchBar.value());
                }
            } else {
                container.style.paddingTop = `0`;
                if (this.flakesFilter !== undefined) {
                    this.flakesFilter = undefined;
                }
            }
        });
    }

    private renderFlakes(entries: types.FlakesEntry[]) {
        this.record = { P0: [], P4: [], P5: [] };

        for (const entry of entries) {
            if (this.checkFilter(entry)) {
                this.record[entry.press]?.push(entry);
            }
        }

        this.record.P0 = this.sortEntries(this.record.P0);
        this.record.P4 = this.sortEntries(this.record.P4);
        this.record.P5 = this.sortEntries(this.record.P5);

        return html`
            <pg-search-bar
                style="top: 0;"
                title="Filter (Bsp.: main=90% a=5% c=5%)"
                storage-key="${this.data?.title}"
                ?active=${!!this.searchBar}
                @change=${async (ev: Event & { currentTarget: app.PGSearchBar }) => {
                    this.flakesFilter = app.PGSearchBar.generateRegExp(ev.currentTarget.value());
                }}
            ></pg-search-bar>

            <div class="container no-scrollbar" style="width: 100%; height: 100%; overflow: auto">
                ${Object.entries(this.record).map(([press, pressData]) =>
                    this.renderFlakesTable(press as types.PressSlot, pressData),
                )}
            </div>

            <pg-flakes-entry-dialog
                @delete=${(ev: Event & { currentTarget: app.PGFlakesEntryDialog }) => {
                    const target = ev.currentTarget;
                    if (target.create || this.data === undefined) return;

                    const newData = {
                        ...this.data,
                        data: this.data.data.filter((entry) => entry !== target.entry),
                    };

                    lib.listStore("special").replaceInStore(
                        app.PGApp.queryStore(),
                        newData,
                        this.data,
                    );

                    this.data = newData;
                }}
                @submit=${(ev: Event & { currentTarget: app.PGFlakesEntryDialog }) => {
                    const target = ev.currentTarget;
                    if (target.entry === undefined || this.data === undefined) return;

                    const newData = { ...this.data };

                    if (target.create) {
                        newData.data.push(target.entry);
                    } else {
                        newData.data = [
                            ...this.data.data.filter((entry) => entry !== target.entry),
                            target.entry,
                        ];
                    }

                    lib.listStore("special").replaceInStore(
                        app.PGApp.queryStore(),
                        newData,
                        this.data,
                    );

                    this.data = newData;
                }}
            ></pg-flakes-entry-dialog>
        `;
    }

    private renderFlakesTable(press: types.PressSlot, entries: types.FlakesEntry[]) {
        return keyed(
            press,
            html`
                <table>
                    <thead>
                        <tr>
                            <th style="text-align: left;" colspan="100%">
                                <span>
                                    ${this.pressConvert[press as types.PressSlot] || "Unknown"}
                                </span>

                                <ui-button
                                    style="float: right;"
                                    variant="full"
                                    color="primary"
                                    @click=${async () => {
                                        const dialog =
                                            this.querySelector<app.PGFlakesEntryDialog>(
                                                `pg-flakes-entry-dialog`,
                                            )!;

                                        dialog.entry = {
                                            press: press as types.PressSlot,
                                            compatatore: 25,
                                            primary: {
                                                percent: 0,
                                                value: 0,
                                            },
                                            secondary: [],
                                        };

                                        dialog.create = true;
                                        dialog.show();
                                    }}
                                >
                                    Neuer Eintrag
                                </ui-button>
                            </th>
                        </tr>

                        <tr>
                            <th style="width: ${100 / 8}%">C1</th>
                            <th style="width: ${100 / 8}%">Main</th>
                            ${this.towerSlots.map(
                                (slot) => html`<th style="width: ${100 / 8}%">${slot}</th>`,
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        ${this.renderFlakesTableEntries(entries)}
                    </tbody>
                </table>
                <br />
            `,
        );
    }

    private renderFlakesTableEntries(entries: types.FlakesEntry[]) {
        return repeat(
            entries,
            (flakesEntry) => flakesEntry,
            (flakesEntry) => {
                const slots: (types.Consumption | null)[] = [null, null, null, null, null, null];

                for (const part of flakesEntry.secondary) {
                    slots[this.towerSlots.indexOf(part.slot)] = {
                        percent: part.percent,
                        value: part.value,
                    };
                }

                return html`
                    <tr
                        style="cursor: pointer;"
                        @click=${() => {
                            const dialog =
                                this.querySelector<app.PGFlakesEntryDialog>(
                                    `pg-flakes-entry-dialog`,
                                )!;

                            dialog.entry = flakesEntry;
                            dialog.create = false;
                            dialog.show();
                        }}
                    >
                        <td style="text-align: center;">${flakesEntry.compatatore}</td>

                        <td style="text-align: center;">
                            ${flakesEntry.primary.percent}%<br />
                            ${flakesEntry.primary.value}
                        </td>

                        ${slots.map((slot) =>
                            slot === null
                                ? html`<td></td>`
                                : html`
                                      <td style="text-align: center;">
                                          ${slot.percent}%<br />
                                          ${slot.value}
                                      </td>
                                  `,
                        )}
                    </tr>
                `;
            },
        );
    }

    private checkFilter(entry: types.FlakesEntry): boolean {
        if (this.searchBar && this.flakesFilter !== undefined) {
            const searchString = `presse=${entry.press},c1=${entry.compatatore},main=${
                entry.primary.percent
            }%,main=${entry.primary.value},${entry.secondary
                .map((c) => `${c.slot}=${c.percent}%,${c.slot}=${c.value}`)
                .join(",")}`;

            return this.flakesFilter.test(searchString);
        }

        return true;
    }

    private sortEntries(entries: types.FlakesEntry[]): types.FlakesEntry[] {
        return entries.sort(
            (a, b) => a.primary.percent - b.primary.percent - (b.compatatore - a.compatatore) / 100,
        );
    }
}

export default PGPageContentFlakes;
