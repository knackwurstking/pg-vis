import { html } from "lit";
import { customElement } from "lit/decorators.js";

import * as app from "@app";
import * as types from "@types";
import { keyed } from "lit/directives/keyed.js";
import { repeat } from "lit/directives/repeat.js";

// TODO: Convert table to pdf for type "flakes"
@customElement("pg-page-content-special")
class PGPageContentSpecial extends app.PGPageContent<types.Special> {
    protected render() {
        super.renderListsAppBarTitle("special", this.data);

        switch (this.data?.type) {
            case "flakes":
                this.renderFlakes(this.data.data);
                break;

            default:
                return html``;
        }

        return html``;
    }

    private renderFlakes(entries: types.FlakesData[]) {
        const data: Record<types.PressSlot, types.FlakesData[]> = {
            P0: [],
            P2: [],
            P3: [],
            P4: [],
            P5: [],
        };

        for (const flakesData of entries) {
            data[flakesData.press]?.push(flakesData);
        }

        const towerSlots: types.TowerSlot[] = ["A", "C", "E", "G", "I", "K"];
        const pressConvert: Record<types.PressSlot, string> = {
            P0: "Presse 0",
            P2: "Presse 2",
            P3: "Presse 3",
            P4: "Presse 4",
            P5: "Presse 5",
        };

        return html`
            <div class="no-scrollbar" style="width: 100%; overflow-x: auto">
                ${Object.entries(data).map(([press, pressData]) =>
                    keyed(
                        pressData,
                        html`
                            <table>
                                <thead>
                                    <tr>
                                        <th colspan="100%">
                                            ${pressConvert[press as types.PressSlot] || "Unknown"}
                                        </th>
                                    </tr>

                                    <tr>
                                        ${towerSlots.map((slot) => html`<th>${slot}</th>`)}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${repeat(
                                        pressData,
                                        (flakesData) => flakesData,
                                        (flakesData) => {
                                            const slots: (types.Consumption | null)[] = [
                                                null,
                                                null,
                                                null,
                                                null,
                                                null,
                                                null,
                                            ];

                                            for (const part of flakesData.secondary) {
                                                slots[towerSlots.indexOf(part.slot)] = {
                                                    percent: part.percent,
                                                    value: part.value,
                                                };
                                            }

                                            return html`
                                                <td>${flakesData.compatatore}</td>

                                                <td>
                                                    ${flakesData.primary.percent},
                                                    ${flakesData.primary.value}
                                                </td>

                                                ${slots.map((slot) =>
                                                    slot === null
                                                        ? html``
                                                        : html`
                                                              <td>
                                                                  ${slot.percent}, ${slot.value}
                                                              </td>
                                                          `,
                                                )}
                                            `;
                                        },
                                    )}
                                </tbody>
                            </table>
                        `,
                    ),
                )}
            </div>
        `;
    }
}

export default PGPageContentSpecial;
