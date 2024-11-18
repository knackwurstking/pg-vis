import { customElement, property } from "lit/decorators.js";

import { html, LitElement, PropertyValues } from "lit";

import * as app from "@app";
import * as types from "@types";

@customElement("pg-vis-list-item")
class PGVisListItem extends LitElement {
    @property({ type: Object, attribute: "data", reflect: true })
    data?: types.Product;

    @property({ type: Boolean, attribute: "route", reflect: true })
    route?: boolean;

    private clickHandler = () => {
        app.PGApp.queryStackLayout()!.setPage(
            "product",
            (page) => {
                const content = page.children[0] as app.PGPageContent<types.Product> | undefined;

                if (content !== undefined) {
                    content.data = this.data;
                }
            },
            true,
        );
    };

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        this.style.display = "block";

        this.style.padding = "var(--ui-spacing)";
        this.style.overflow = "hidden";
        this.style.position = "relative";
        this.style.borderRadius = "0";
        this.style.borderBottom = "1px solid hsl(var(--ui-hsl-borderColor)";

        return this;
    }

    protected render() {
        if (this.data === undefined) return html``;

        return html`
            <ui-flex-grid gap="0.25rem">
                <ui-flex-grid-row gap="0.25rem">
                    <ui-flex-grid-item style="padding: var(--ui-spacing);" align="center">
                        <ui-text
                            style="color: hsl(var(--ui-hsl-primary));"
                            wght="750"
                        >
                            ${this.data.lotto}
                        </ui-text>
                    </ui-flex-grid-item>

                    <ui-flex-grid-item style="padding: var(--ui-spacing);" align="center">
                        <ui-text>${this.data.name}</ui-text>
                    </ui-flex-grid-item>
                </ui-flex-grid-row>

                <ui-flex-grid-row gap="0.25rem">
                    <ui-flex-grid-item style="padding: var(--ui-spacing);" align="center">
                        <ui-text>${this.data.format}</ui-text>
                    </ui-flex-grid-item>

                    <ui-flex-grid-item style="padding: var(--ui-spacing);" align="center">
                        <ui-text>${this.data.stamp}</ui-text>
                    </ui-flex-grid-item align="center">

                    <ui-flex-grid-item style="padding: var(--ui-spacing);" align="center">
                        <ui-text>${this.data.thickness}</ui-text>
                    </ui-flex-grid-item>
                </ui-flex-grid-row>
            </ui-flex-grid>
        `;
    }

    protected updated(_changedProperties: PropertyValues): void {
        if (this.route) {
            this.addEventListener("click", this.clickHandler);
            this.role = "button";
            this.style.cursor = "pointer";
        } else {
            this.removeEventListener("click", this.clickHandler);
            this.role = null;
            this.style.cursor = "default";
        }
    }
}

export default PGVisListItem;
