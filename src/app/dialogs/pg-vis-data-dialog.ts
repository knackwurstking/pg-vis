import { customElement, property } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";

import { html, LitElement } from "lit";
import { UIDialog, UIInput } from "ui";

/**
 * @fires submit
 */
@customElement("pg-vis-data-dialog")
class PGVisDataDialog extends LitElement {
    /**
     * The `VisData` "title" field
     */
    @property({ type: String, attribute: "title", reflect: true })
    title: string = "";

    @property({ type: Boolean, attribute: "invalid-title", reflect: true })
    invalidTitle?: boolean;

    public show() {
        this.querySelector<UIDialog>("ui-dialog")!.show();
    }

    public close() {
        this.querySelector<UIDialog>("ui-dialog")!.close();
    }

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    protected render() {
        return html`
            <ui-dialog title="Vis Data" modal inert>
                <ui-flex-grid gap="0.25rem">
                    <ui-flex-grid-item>
                        ${keyed(
                            this.title,
                            html`
                                <ui-input
                                    title="Name"
                                    type="text"
                                    value="${this.title}"
                                    ?invalid=${this.invalidTitle}
                                    @change=${(ev: Event & { currentTarget: UIInput }) => {
                                        this.title = ev.currentTarget.value;
                                    }}
                                >
                                </ui-input>
                            `,
                        )}
                    </ui-flex-grid-item>
                </ui-flex-grid>

                <ui-button
                    slot="actions"
                    variant="full"
                    color="secondary"
                    @click=${async () => this.close()}
                >
                    Abbrechen
                </ui-button>

                <ui-button
                    slot="actions"
                    variant="full"
                    color="primary"
                    @click=${async () => {
                        this.dispatchEvent(new Event("submit"));
                        this.close();
                    }}
                >
                    OK
                </ui-button>
            </ui-dialog>
        `;
    }
}

export default PGVisDataDialog;
