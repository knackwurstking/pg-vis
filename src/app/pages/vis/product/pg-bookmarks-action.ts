import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { svg } from "ui";
import { Product } from "../../../../store-types";
import { PGBookmarkDialog } from "../../../dialogs";

@customElement("pg-bookmarks-action")
class PGBookmarksAction extends LitElement {
    @property({ type: Object, attribute: "product", reflect: false })
    product?: Product;

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    protected render() {
        const buttonClick = () => {
            if (this.product === undefined) return;
            const dialog = this.querySelector<PGBookmarkDialog>(`pg-bookmark-dialog`)!;
            dialog.show();
        };

        return html`
            <ui-button variant="outline" color="secondary" ripple @click=${buttonClick}>
                <ui-svg style="width: 2rem;">${svg.smoothieLineIcons.bookmark}</ui-svg>
                Speichern
            </ui-button>

            <ui-bookmark-dialog
                product="${JSON.stringify(this.product) || ""}"
            ></ui-bookmark-dialog>
        `;
    }
}

export default PGBookmarksAction;
