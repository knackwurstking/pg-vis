import { html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
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

                    <ui-flex-grid-item>
                        ${this.renderData()}
                    </ui-flex-grid-item>
                </ui-flex-grid>
            </div>
        `;
    }

    private renderData() {
        if (this.data === undefined) return html``;

        const visData = PGApp.queryStore().getData("visData");
        if (visData === undefined) return html``;

        const content: TemplateResult<1>[] = [];
        for (const list of visData) {
            // TODO: Add (`list.title`) title element to content
            for (const _entry of list.data) {
                // TODO: Check filter and create element, add to content
            }
        }

        return html`${content}`;
    }
}

export default PGPageContentProduct;
