import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { svg } from "ui";

import * as app from "@app";
import * as types from "@types";

@customElement("pg-bookmarks-action")
class PGBookmarksAction extends LitElement {
    @property({ type: Object, attribute: "product", reflect: false })
    product?: types.Product;

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    protected render() {
        const buttonClick = () => {
            if (this.product === undefined) return;
            const dialog = app.PGApp.queryBookmarkSelectDialog()!;
            dialog.product = this.product;
            dialog.show();
        };

        return html`
            <ui-button variant="outline" color="secondary" ripple @click=${buttonClick}>
                <ui-svg style="width: 2rem;">${svg.smoothieLineIcons.bookmark}</ui-svg>
                Speichern
            </ui-button>
        `;
    }
}

export default PGBookmarksAction;
