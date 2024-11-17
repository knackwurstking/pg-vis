import { customElement, property, state } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";
import { repeat } from "lit/directives/repeat.js";

import { html } from "lit";

import * as app from "@app";
import * as lib from "@lib";
import * as types from "@types";

// TODO: Convert table to pdf for type "flakes"
@customElement("pg-page-content-special")
class PGPageContentSpecial extends app.PGPageContent<types.Special> {
    @state()
    private flakesFilter?: types.FlakesFilter;

    private towerSlots: types.TowerSlot[] = ["A", "C", "E", "G", "I", "K"];

    private pressConvert: Record<types.PressSlot, string> = {
        P0: "Presse 0",
        P2: "Presse 2",
        P3: "Presse 3",
        P4: "Presse 4",
        P5: "Presse 5",
    };

    protected render() {
        super.renderListsAppBarTitle("special", this.data);

        switch (this.data?.type) {
            case "flakes":
                return this.renderFlakes(this.data.data);

            default:
                return html``;
        }
    }

    private renderFlakes(entries: types.FlakesEntry[]) {
        const data: Record<types.PressSlot, types.FlakesEntry[]> = {
            P0: [],
            P2: [],
            P3: [],
            P4: [],
            P5: [],
        };

        for (const entry of entries) {
            if (this.checkFilter(entry)) {
                data[entry.press]?.push(entry);
            }
        }

        data.P0 = this.sortEntries(data.P0);
        data.P2 = this.sortEntries(data.P2);
        data.P3 = this.sortEntries(data.P3);
        data.P4 = this.sortEntries(data.P4);
        data.P5 = this.sortEntries(data.P5);

        return html`
            <pg-flakes-filter-bar
                @change=${async (ev: Event & { currentTarget: app.PGFlakesFilterBar }) => {
                    this.flakesFilter = { ...ev.currentTarget.filter };
                }}
            ></pg-flakes-filter-bar>

            <br />

            <div class="no-scrollbar" style="width: 100%; overflow-x: auto">
                ${Object.entries(data)
                    .filter(([_press, pressData]) => pressData.length > 0)
                    .map(([press, pressData]) =>
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
        if (this.flakesFilter !== undefined) {
            if (this.flakesFilter.c1 !== null) {
                if (entry.compatatore !== this.flakesFilter.c1) {
                    return false;
                }
            }

            if (this.flakesFilter.main !== null) {
                if (
                    entry.primary.percent !== this.flakesFilter.main &&
                    entry.primary.value !== this.flakesFilter.main
                ) {
                    return false;
                }
            }

            let index = -1;
            slot_filter_loop: for (const slotFilter of this.flakesFilter.towerSlots) {
                index++;

                if (slotFilter === null) continue;

                const secondary = entry.secondary.filter(
                    (consumption) => consumption.slot === this.towerSlots[index],
                );

                if (secondary.length === 0 && slotFilter > 0) return false;

                for (const consumption of secondary) {
                    if (consumption.percent !== slotFilter && consumption.value !== slotFilter) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    private sortEntries(entries: types.FlakesEntry[]): types.FlakesEntry[] {
        return entries.sort(
            (a, b) => a.primary.percent - b.primary.percent - (b.compatatore - a.compatatore),
        );
    }
}

export default PGPageContentSpecial;
