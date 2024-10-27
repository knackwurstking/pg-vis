import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Alert } from "../types";

@customElement("pg-alert-list-item")
class PGAlertListItem extends LitElement {
    @property({ type: Object, attribute: "data", reflect: false })
    data?: Alert;

    // TODO: Continue here...
    static get styles() {
        return css`
            div.number {
                color: hsl(var(--ui-hsl-primary));
                font-weight: bold;
            }
        `;
    }

    protected render() {
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
}

export default PGAlertListItem;
