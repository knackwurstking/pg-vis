import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import { html, LitElement } from "lit";
import { UIDialog } from "ui";

import * as types from "@types";

/**
 * @fires submit
 * @fires delete
 */
@customElement("pg-flakes-entry")
class PGFlakesEntry extends LitElement {
    @property({ type: Object, attribute: "entry", reflect: true })
    entry?: types.FlakesEntry;

    @property({ type: Boolean, attribute: "index", reflect: true })
    create?: boolean;

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    protected render(): unknown {
        return html`
            <ui-dialog title="" modal inert>
                <ui-flex-grid gap="0.25rem">${this.renderInputs()}</ui-flex-grid>

                ${this.renderDeleteAction()}

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

    private renderInputs() {
        return html`
            <ui-flex-grid>
                <ui-secondary>C1</ui-secondary>

                <ui-input title="Geschwindigkeit" type="number"></ui-input>
            </ui-flex-grid>

            ${repeat(
                ["Main", "A", "C", "E", "G", "I", "K"],
                (slot) => slot,
                (slot) => html`
                    <ui-flex-grid>
                        <ui-secondary>${slot}</ui-secondary>

                        <ui-flex-grid-row gap="0.25rem">
                            <ui-input title="Prozent" type="number"></ui-input>
                            <ui-input title="Geschwindigkeit" type="number"></ui-input>
                        </ui-flex-grid-row>
                    </ui-flex-grid>
                `,
            )}
        `;
    }

    private renderDeleteAction() {
        if (!!this.create) return html``;

        return html`
            <ui-button
                slot="actions"
                variant="full"
                color="destructive"
                @click=${async () => {
                    this.dispatchEvent(new Event("delete"));
                    this.close();
                }}
            >
                Löschen
            </ui-button>
        `;
    }

    public show() {
        this.querySelector<UIDialog>("ui-dialog")!.show();
    }

    public close() {
        this.querySelector<UIDialog>("ui-dialog")!.close();
    }
}

export default PGFlakesEntry;
