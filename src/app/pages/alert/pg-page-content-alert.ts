import { html, PropertyValues, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { Alert } from "../../../store-types";
import PGPageContent from "../pg-page-content";

@customElement("pg-page-content-alert")
class PGPageContentAlert extends PGPageContent<Alert> {
    protected render(): TemplateResult<1> {
        return html`
            <ui-flex-grid style="width: 100%; height: 100%;">
                <ui-flex-grid-item flex="0">
                    ${this.data !== undefined
                        ? html`<pg-alert-list-item
                              data=${JSON.stringify(this.data)}
                          ></pg-alert-list-item>`
                        : ""}
                </ui-flex-grid-item>

                <hr />

                <ui-flex-grid-item>
                    <p
                        class="description"
                        style="padding: var(--ui-spacing);"
                    ></p>
                </ui-flex-grid-item>
            </ui-flex-grid>
        `;
    }

    protected updated(_changedProperties: PropertyValues): void {
        if (this.data !== undefined) {
            const description = this.querySelector(`.description`)!;
            description.innerHTML = this.data.desc.join("<br/>");
        }
    }

    protected firstUpdated(_changedProperties: PropertyValues): void {
        this.style.overflow = "auto";
    }
}

export default PGPageContentAlert;
