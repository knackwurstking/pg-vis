import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { styles } from "ui";
import { Product } from "../../../../store-types";
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
                        <!-- TODO: Vis data here -->
                    </ui-flex-grid-item>
                </ui-flex-grid>
            </div>
        `;
    }
}

export default PGPageContentProduct;
