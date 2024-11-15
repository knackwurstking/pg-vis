import { html } from "lit";
import { customElement } from "lit/decorators.js";

import * as app from "@app";
import * as types from "@types";
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

    private renderFlakes(data: types.FlakesData[]) {
        return html`
            <div class="no-scrollbar" style="width: 100%; overflow-x: auto">
                ${repeat(
                    data,
                    (data) => `${data.press}`,
                    (data, index) => html`
                        <table>
                            <thead>
                                <tr>
                                    <!-- TODO: Table Heading 1: Press info (colspan: 100%) -->
                                </tr>
                                <tr>
                                    <!-- TODO: Table Heading 2: compatatore & (secondary) slots -->
                                </tr>
                            </thead>
                            <tbody>
                                <!-- TODO: Render compatatore speed -->
                                ${repeat(
                                    data.secondary,
                                    (secondaryData) =>
                                        `${secondaryData.slot},${secondaryData.percent},${secondaryData.value}`,
                                    (secondaryData, index) => html``, // TODO: ...
                                )}
                            </tbody>
                        </table>
                    `,
                )}
            </div>
        `;
    }
}

export default PGPageContentSpecial;
