import { html, PropertyValues, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { newListsStore } from "../../../lib/lists-store";
import { MetalSheet } from "../../../store-types";
import PGApp from "../../pg-app";
import PGPageContent from "../pg-page-content";
import { styles } from "ui";

@customElement("pg-page-content-metal-sheets")
class PGPageContentMetalSheets extends PGPageContent<MetalSheet> {
    protected render(): TemplateResult<1> {
        PGApp.queryAppBar()!.contentName("title")!.contentAt(0).innerText =
            this.data !== undefined
                ? newListsStore("metalSheets").fileName(this.data)
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
                <!-- TODO: New table entry button here... -->
            </ui-flex-grid-row>
        `;
    }

    private renderTableHeader() {
        if (!this.data) return html``;

        const content: TemplateResult<1>[] = [];
        for (const title of this.data.data.table.header) {
            content.push(html`
                <th style="text-align: center; text-wrap: nowrap;">${title}</th>
            `);
        }

        return html`${[...content]}`;
    }

    private renderTableBody() {
        if (!this.data) return html``;

        const content: TemplateResult<1>[] = [];
        for (const data of this.data.data.table.data) {
            // TODO: Add "data-json" to "tr"
            // TODO: Add @click handler -> modify table entry dialog
            content.push(html`
                <tr style="cursor: pointer;" role="button">
                    ${[
                        ...data.map(
                            (part) => html`
                                <td style="text-align: center;">${part}</td>
                            `,
                        ),
                    ]}
                </tr>
            `);
        }

        return html`${[...content]}`;
    }

    protected updated(_changedProperties: PropertyValues): void {
        // TODO: Make table body children draggable
    }

    protected firstUpdated(_changedProperties: PropertyValues): void {
        this.classList.add("no-scrollbar");

        this.style.overflow = "hidden";
        this.style.overflowY = "auto";
    }
}
export default PGPageContentMetalSheets;
