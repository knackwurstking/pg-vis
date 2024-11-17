import { customElement, property } from "lit/decorators.js";

import { html, LitElement, PropertyValues } from "lit";

import * as app from "@app";
import * as types from "@types";

@customElement("pg-alert-list-item")
class PGAlertListItem extends LitElement {
    @property({ type: Object, attribute: "data", reflect: false })
    data?: types.Alert;

    @property({ type: Boolean, attribute: "route", reflect: true })
    route?: boolean;

    private clickHandler = () => {
        app.PGApp.queryStackLayout()!.setPage(
            "alert",
            (page) => {
                const content = page.children[0] as app.PGPageContent<types.Alert> | undefined;

                if (content !== undefined) {
                    content.data = this.data;
                }
            },
            true,
        );
    };

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        this.classList.add("flex");
        this.classList.add("row");
        this.classList.add("nowrap");
        this.classList.add("align-center");
        this.classList.add("justify-between");

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
            <ui-text>${this.data.alert}</ui-text>

            <ui-text
                style="color: hsl(var(--ui-hsl-primary)); text-wrap: nowrap; margin-left: var(--ui-spacing);"
                wght="750"
            >
                ${this.data.from === this.data.to
                    ? this.data.from
                    : `${this.data.from}..${this.data.to}`}
            </ui-text>
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

export default PGAlertListItem;
