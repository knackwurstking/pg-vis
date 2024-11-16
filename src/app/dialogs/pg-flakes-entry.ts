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
            <ui-dialog title="Flakes ${this.entry?.press || ""}" modal inert>
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

    // TODO: Add Input handler and update entry
    private renderInputs() {
        const towerSlots: ("Main" | types.TowerSlot)[] = ["A", "C", "E", "G", "I", "K"];

        return html`
            <ui-flex-grid>
                <ui-flex-grid-row gap="0.25rem">
                    <ui-flex-grid-item>
                        <ui-secondary>C1</ui-secondary>
                    </ui-flex-grid-item>
                    <ui-flex-grid-item>
                        <ui-secondary>Main</ui-secondary>
                    </ui-flex-grid-item>
                </ui-flex-grid-row>

                <ui-flex-grid-row gap="0.25rem">
                    <ui-input
                        title="Geschwindigkeit"
                        type="number"
                        value=${this.entry?.compatatore || ""}
                    ></ui-input>

                    <ui-input
                        title="Geschwindigkeit"
                        type="number"
                        value=${this.entry?.primary.value || ""}
                    ></ui-input>
                </ui-flex-grid-row>
            </ui-flex-grid>

            ${repeat(
                towerSlots,
                (slot) => slot,
                (slot) => {
                    const consumption = this.consumptionFor(slot);

                    return html`
                        <ui-flex-grid>
                            <ui-secondary>${slot}</ui-secondary>

                            <ui-flex-grid-row gap="0.25rem">
                                <ui-input
                                    title="Prozent"
                                    type="number"
                                    value=${consumption?.percent}
                                ></ui-input>

                                <ui-input
                                    title="Geschwindigkeit"
                                    type="number"
                                    value=${consumption?.value}
                                ></ui-input>
                            </ui-flex-grid-row>
                        </ui-flex-grid>
                    `;
                },
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

    public consumptionFor(slot: string): types.Consumption | null {
        switch (slot) {
            case "Main":
                return this.entry?.primary || null;

            default:
                return this.entry?.secondary.find(
                    (c) => c.slot === slot,
                ) as types.Consumption | null;
        }
    }

    public show() {
        this.querySelector<UIDialog>("ui-dialog")!.show();
    }

    public close() {
        this.querySelector<UIDialog>("ui-dialog")!.close();
    }
}

export default PGFlakesEntry;
