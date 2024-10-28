import { html, LitElement, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { CleanUpFunction, ripple } from "ui";
import { Alert } from "../types";

@customElement("pg-alert-list-item")
class PGAlertListItem extends LitElement {
    @property({ type: Object, attribute: "data", reflect: false })
    data?: Alert;

    @property({ type: Boolean, attribute: "ripple", reflect: true })
    ripple?: boolean;

    private rippleCleanUp: CleanUpFunction | null = null;

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    protected render() {
        if (this.data === undefined) return html``;

        if (this.ripple && this.rippleCleanUp === null) {
            this.style.cursor = "pointer";
            this.role = "button";
            this.rippleCleanUp = ripple.create(this);
        } else if (!this.ripple && this.rippleCleanUp !== null) {
            this.style.cursor = "default";
            this.role = "none";
            this.rippleCleanUp();
            this.rippleCleanUp = null;
        }

        return html`
            <ui-text>${this.data.alert}</ui-text>

            <ui-text style="color: hsl(var(--ui-hsl-primary));" wght="750">
                ${this.data.from === this.data.to
                    ? this.data.from
                    : `${this.data.from}..${this.data.to}`}
            </ui-text>
        `;
    }

    protected firstUpdated(_changedProperties: PropertyValues): void {
        this.classList.add("flex");
        this.classList.add("row");
        this.classList.add("nowrap");
        this.classList.add("align-center");
        this.classList.add("justify-between");

        this.style.padding = "var(--ui-spacing)";
        this.style.overflow = "hidden";
        this.style.position = "relative";
        this.style.borderRadius = "var(--ui-radius)";
    }
}

export default PGAlertListItem;
