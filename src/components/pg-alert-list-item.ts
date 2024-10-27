import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { CleanUpFunction, ripple } from "ui";
import { Alert } from "../types";

@customElement("pg-alert-list-item")
class PGAlertListItem extends LitElement {
    role = "button";

    @property({ type: Object, attribute: "data", reflect: false })
    data?: Alert;

    @property({ type: Boolean, attribute: "border", reflect: true })
    border?: boolean;

    @property({ type: Boolean, attribute: "ripple", reflect: true })
    ripple?: boolean;

    private rippleCleanUp: CleanUpFunction | null = null;

    static get styles() {
        return css`
            div.number {
                color: hsl(var(--ui-hsl-primary));
                font-weight: bold;
            }
        `;
    }

    protected render() {
        if (this.border) {
            this.style.borderBottom = `1px solid hsl(var(--ui-hsl-borderColor))`;
        } else {
            this.style.borderBottom = "none";
        }

        if (this.ripple && this.rippleCleanUp === null) {
            this.rippleCleanUp = ripple.create(this);
            this.style.cursor = "pointer";
        } else if (!this.ripple) {
            if (this.rippleCleanUp !== null) {
                this.style.cursor = "default";
                this.rippleCleanUp();
                this.rippleCleanUp = null;
            }
        }

        if (this.data === undefined) return html``;

        return html`
            <div class="title">${this.data.alert}</div>

            <div class="number">
                ${this.data.from === this.data.to
                    ? this.data.from
                    : `${this.data.from}..${this.data.to}`}
            </div>
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
    }
}

export default PGAlertListItem;
