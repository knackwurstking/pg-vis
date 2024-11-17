import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import { html, LitElement } from "lit";
import { UIDialog, UIInput } from "ui";

import * as types from "@types";

/**
 * @fires submit
 * @fires delete
 */
@customElement("pg-flakes-entry-dialog")
class PGFlakesEntryDialog extends LitElement {
    @property({ type: Object, attribute: "entry", reflect: true })
    entry?: types.FlakesEntry;

    @property({ type: Boolean, attribute: "index", reflect: true })
    create?: boolean;

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

    private renderInputs() {
        const towerSlots: types.TowerSlot[] = ["A", "C", "E", "G", "I", "K"];

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
                        @change=${(ev: Event & { currentTarget: UIInput }) => {
                            if (this.entry === undefined) return;
                            this.entry.compatatore = parseInt(ev.currentTarget.value || "0", 10);
                        }}
                    ></ui-input>

                    <ui-input
                        title="Geschwindigkeit"
                        type="number"
                        value=${this.entry?.primary.value || ""}
                        @change=${(ev: Event & { currentTarget: UIInput }) => {
                            if (this.entry === undefined) return;
                            this.entry.primary.value = parseFloat(ev.currentTarget.value || "0");
                            this.entry.primary.percent = this.calcMainPercent();
                        }}
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
                                    value=${consumption?.percent || 0}
                                    @change=${(ev: Event & { currentTarget: UIInput }) => {
                                        if (this.entry === undefined) return;

                                        const value = parseFloat(ev.currentTarget.value || "0");

                                        try {
                                            for (const entry of this.entry.secondary) {
                                                if (entry.slot === slot) {
                                                    entry.percent = value;
                                                    return;
                                                }
                                            }

                                            this.entry.secondary.push({
                                                slot: slot,
                                                percent: value,
                                                value: 0,
                                            });
                                        } finally {
                                            this.entry.primary.percent = this.calcMainPercent();
                                        }
                                    }}
                                ></ui-input>

                                <ui-input
                                    title="Geschwindigkeit"
                                    type="number"
                                    value=${consumption?.value || 0}
                                    @change=${(ev: Event & { currentTarget: UIInput }) => {
                                        if (this.entry === undefined) return;

                                        const value = parseFloat(ev.currentTarget.value || "0");

                                        for (const entry of this.entry.secondary) {
                                            if (entry.slot === slot) {
                                                entry.value = value;
                                                return;
                                            }
                                        }

                                        this.entry.secondary.push({
                                            slot: slot,
                                            percent: 0,
                                            value: value,
                                        });
                                    }}
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

    private calcMainPercent(): number {
        if (this.entry === undefined) return 100;

        let secondaryPercent = 0;
        for (const entry of this.entry.secondary) {
            secondaryPercent += entry.percent;
        }

        return 100 - secondaryPercent;
    }
}

export default PGFlakesEntryDialog;
