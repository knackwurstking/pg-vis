import { html } from "lit";
import { DirectiveResult } from "lit/async-directive.js";
import { customElement } from "lit/decorators.js";
import { Keyed, keyed } from "lit/directives/keyed.js";
import { styles } from "ui";
import { Product } from "../../../../store-types";
import PGApp from "../../../pg-app";
import PGPageContent from "../../pg-page-content";

@customElement("pg-page-contents-product")
class PGPageContentProduct extends PGPageContent<Product> {
    /* TODO:
     *  Bookmarks:
     *      - Add this product to a bookmarks list (per dialog or html select)
     *  Edit Mode:
     *      - Checkbox label: "is flakes product"
     *      - Setup flakes product using a template for P4 / P5 or P0
     */

    protected render() {
        return html`
            <div
                class="container no-scrollbar"
                style="${styles({
                    width: "100%",
                    height: "100%",
                    overflow: "auto",
                } as CSSStyleDeclaration)}"
            >
                <ui-flex-grid gap="0.25rem">
                    <ui-flex-grid-item>
                        ${this.data !== undefined
                            ? html`<pg-vis-list-item
                                  data=${JSON.stringify(this.data)}
                              ></pg-vis-list-item>`
                            : ""}
                    </ui-flex-grid-item>

                    ${this.renderData()}
                </ui-flex-grid>
            </div>
        `;
    }

    private renderData() {
        if (this.data === undefined) return html``;

        const visData = PGApp.queryStore().getData("visData");
        if (visData === undefined) return html``;

        let entryIndex = -1;
        const content: DirectiveResult<typeof Keyed>[] = [];
        for (const list of visData) {
            entryIndex++;

            let hasHeading = false;
            for (const entry of list.data) {
                if (!this.isLotto(entry.lotto, this.data.lotto)) {
                    continue;
                }

                if (!this.isFormat(entry.format, this.data.format)) {
                    continue;
                }

                if (!this.isStamp(entry.stamp, this.data.stamp)) {
                    continue;
                }

                if (!this.isThickness(entry.thickness, this.data.thickness)) {
                    continue;
                }

                if (!hasHeading) {
                    hasHeading = true;
                    content.push(
                        keyed(
                            list.title,
                            html`
                                <ui-flex-grid-item>
                                    <ui-heading level="4">
                                        ${list.title}
                                    </ui-heading>
                                </ui-flex-grid-item>
                            `,
                        ),
                    );
                }

                content.push(
                    keyed(
                        entry,
                        html`
                            <pg-vis-data-list-item
                                data="${JSON.stringify(entry)}"
                                entry-index=${entryIndex}
                            ></pg-vis-data-list-item>
                        `,
                    ),
                );
            }
            hasHeading = false;
        }

        // TODO: This needs some styling
        return html`
            <ui-flex-grid direction="column" align="center" gap="0.25rem">
                ${content}
            </ui-flex-grid>
        `;
    }

    private isLotto(match: string | null, lotto: string): boolean {
        if (match === null) return true;

        return new RegExp(match, "i").test(lotto);
    }

    private isFormat(match: string | null, format: string) {
        if (match === null) return true;

        return new RegExp(match, "i").test(format);
    }

    private isStamp(match: string | null, stamp: string) {
        if (match === null) return true;

        return new RegExp(match, "i").test(stamp);
    }

    private isThickness(match: string | null, thickness: number) {
        if (match === null) return true;

        return new RegExp(match, "i").test(thickness.toString());
    }
}

export default PGPageContentProduct;
