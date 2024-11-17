import { customElement } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";
import { repeat } from "lit/directives/repeat.js";

import { html } from "lit";
import { CleanUp } from "ui";

import * as app from "@app";
import * as types from "@types";

// TODO: Convert table to pdf for type "flakes"
@customElement("pg-page-content-special")
class PGPageContentSpecial extends app.PGPageContent<types.Special> {
    private cleanup = new CleanUp();
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
            data[entry.press]?.push(entry);
        }

        data.P0 = this.sortEntries(data.P0);
        data.P2 = this.sortEntries(data.P2);
        data.P3 = this.sortEntries(data.P3);
        data.P4 = this.sortEntries(data.P4);
        data.P5 = this.sortEntries(data.P5);

        return html`
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

                    this.data.data = this.data.data.filter((entry) => entry !== target.entry);
                    this.data = { ...this.data };
                }}
                @submit=${(ev: Event & { currentTarget: app.PGFlakesEntryDialog }) => {
                    const target = ev.currentTarget;
                    if (target.entry === undefined || this.data === undefined) return;

                    if (target.create) {
                        this.data.data.push(target.entry);
                        this.data = { ...this.data };
                    } else {
                        this.data = {
                            ...this.data,
                            data: [
                                ...this.data.data.filter((entry) => entry !== target.entry),
                                target.entry,
                            ],
                        };
                    }
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

    connectedCallback(): void {
        super.connectedCallback();

        // TODO: Store handler - trigger re-render
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.cleanup.run();
    }

    public sortEntries(entries: types.FlakesEntry[]): types.FlakesEntry[] {
        return entries.sort(
            (a, b) => a.primary.percent - b.primary.percent - (b.compatatore - a.compatatore),
        );
    }
}

export default PGPageContentSpecial;
