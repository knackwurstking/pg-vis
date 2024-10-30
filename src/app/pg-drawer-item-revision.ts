import { PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { html, UIDrawerGroupItem } from "ui";

@customElement("pg-drawer-item-revision")
class PGDrawerItemRevision extends UIDrawerGroupItem {
    @property({ type: String, attribute: "revision", reflect: true })
    revision?: string;

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    protected render() {
        return html`
            <ui-flex-grid>
                <ui-flex-grid-item>
                    <ui-text size="0.9rem">${this.revision}</ui-text>
                </ui-flex-grid-item>

                <ui-flex-grid-item>
                    <ui-button variant="full" color="secondary">
                        Aktualisieren
                    </ui-button>
                </ui-flex-grid-item>
            </ui-flex-grid>
        `;
    }

    protected firstUpdated(_changedProperties: PropertyValues): void {
        super.firstUpdated(_changedProperties);

        this.classList.add("is-debug");
    }
}

export default PGDrawerItemRevision;
