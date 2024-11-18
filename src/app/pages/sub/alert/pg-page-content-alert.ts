import { customElement } from "lit/decorators.js";

import { html, PropertyValues, TemplateResult } from "lit";
import { styles } from "ui";

import * as app from "@app";
import * as types from "@types";

@customElement("pg-page-content-alert")
class PGPageContentAlert extends app.PGPageContent<types.Alert> {
    protected render(): TemplateResult<1> {
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
                            ? html`<pg-alert-list-item
                                  data=${JSON.stringify(this.data)}
                              ></pg-alert-list-item>`
                            : ""}
                    </ui-flex-grid-item>

                    <ui-flex-grid-item>
                        <p class="description" style="padding: var(--ui-spacing);"></p>
                    </ui-flex-grid-item>
                </ui-flex-grid>
            </div>
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
