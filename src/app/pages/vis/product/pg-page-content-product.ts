import { html } from "lit";
import { styles } from "ui";
import { Product } from "../../../../store-types";
import PGPageContent from "../../pg-page-content";

class PGPageContentProduct extends PGPageContent<Product> {
    protected render() {
        return html`
            <div
                class="container no-scrollbar"
                style="${styles({
                    width: "100%",
                    height: "100%",
                    overflow: "auto",
                } as CSSStyleDeclaration)}"
            ></div>
        `; // TODO: Continue here...
    }
}

export default PGPageContentProduct;
