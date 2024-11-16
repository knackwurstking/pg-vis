import { html } from "lit";
import { customElement } from "lit/decorators.js";

import * as app from "@app";
import * as types from "@types";
import { keyed } from "lit/directives/keyed.js";
import { repeat } from "lit/directives/repeat.js";

// TODO: Convert table to pdf for type "flakes"
@customElement("pg-page-content-special")
class PGPageContentSpecial extends app.PGPageContent<types.Special> {
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

        for (const flakesData of entries) {
            data[flakesData.press]?.push(flakesData);
        }

        return html`
            <div class="no-scrollbar" style="width: 100%; overflow-x: auto">
                ${Object.entries(data)
                    .filter(([_press, pressData]) => pressData.length > 0)
                    .map(([press, pressData]) =>
                        this.renderFlakesTable(press as types.PressSlot, pressData),
                    )}
            </div>
        `;
    }

    private renderFlakesTable(press: types.PressSlot, entries: types.FlakesEntry[]) {
        // TODO: Add action button(s): "New Entry", just like metal sheets
        return keyed(
            press,
            html`
                <table>
                    <thead>
                        <tr>
                            <th colspan="100%">
                                ${this.pressConvert[press as types.PressSlot] || "Unknown"}
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
            (flakesData) => flakesData,
            (flakesData) => {
                const slots: (types.Consumption | null)[] = [null, null, null, null, null, null];

                for (const part of flakesData.secondary) {
                    slots[this.towerSlots.indexOf(part.slot)] = {
                        percent: part.percent,
                        value: part.value,
                    };
                }

                // TODO: Make `tr` clickable => open new page for edit or delete, just like metal sheets page
                return html`
                    <tr>
                        <td style="text-align: center;">${flakesData.compatatore}</td>

                        <td style="text-align: center;">
                            ${flakesData.primary.percent}%<br />
                            ${flakesData.primary.value}
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
}

export default PGPageContentSpecial;
