import { customElement, property } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";

import { html, LitElement } from "lit";
import { UIDialog, UIInput, UISelect } from "ui";

/**
 * @fires submit
 */
@customElement("pg-metal-sheet-table-dialog")
class PGMetalSheetTableDialog extends LitElement {
    /**
     * This is for the dialog title
     */
    @property({ type: String, attribute: "title", reflect: true })
    title: string = "";

    @property({ type: String, attribute: "format", reflect: true })
    format: string = "";

    @property({ type: String, attribute: "tool-id", reflect: true })
    toolID: string = "";

    @property({ type: Number, attribute: "press", reflect: true })
    press: number = -1;

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
            <ui-dialog title=${this.title} modal inert>
                <ui-flex-grid gap="0.25rem">
                    <ui-flex-grid-item>
                        ${keyed(
                            this.format,
                            html`
                                <ui-input
                                    type="text"
                                    title="Format"
                                    value=${this.format}
                                    @change=${(ev: Event & { currentTarget: UIInput }) => {
                                        this.format = ev.currentTarget.value;
                                    }}
                                ></ui-input>
                            `,
                        )}
                    </ui-flex-grid-item>

                    <ui-flex-grid-item>
                        ${keyed(
                            this.toolID,
                            html`
                                <ui-input
                                    type="text"
                                    title="Unterteil ID"
                                    value=${this.toolID}
                                    @change=${(ev: Event & { currentTarget: UIInput }) => {
                                        this.toolID = ev.currentTarget.value;
                                    }}
                                ></ui-input>
                            `,
                        )}
                    </ui-flex-grid-item>

                    <ui-flex-grid-item> ${this.renderPressSelect()} </ui-flex-grid-item>
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

    private renderPressSelect() {
        return keyed(
            this.press,
            html`
                <ui-label primary="Presse">
                    <ui-select
                        @change=${(
                            ev: Event & {
                                currentTarget: UISelect;
                            },
                        ) => {
                            const target = ev.currentTarget;

                            const selected = target.selected();
                            if (!selected) return;

                            this.press = parseInt(selected.value, 10);
                        }}
                    >
                        <ui-select-option value="-1" ?selected=${this.press === -1}>
                            -
                        </ui-select-option>

                        <ui-select-option value="0" ?selected=${this.press === 0}>
                            0
                        </ui-select-option>

                        <ui-select-option value="2" ?selected=${this.press === 2}>
                            2
                        </ui-select-option>

                        <ui-select-option value="3" ?selected=${this.press === 3}>
                            3
                        </ui-select-option>

                        <ui-select-option value="4" ?selected=${this.press === 4}>
                            4
                        </ui-select-option>

                        <ui-select-option value="5" ?selected=${this.press === 5}>
                            5
                        </ui-select-option>
                    </ui-select>
                </ui-label>
            `,
        );
    }
}

export default PGMetalSheetTableDialog;
