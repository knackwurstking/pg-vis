import { DirectiveResult } from "lit/async-directive.js";
import { customElement, property } from "lit/decorators.js";
import { keyed, Keyed } from "lit/directives/keyed.js";

import { html, LitElement } from "lit";
import { UIDialog, UIInput } from "ui";

/**
 * @fires submit
 * @fires delete
 */
@customElement("pg-metal-sheet-entry-dialog")
class PGMetalSheetEntryDialog extends LitElement {
    @property({ type: Object, attribute: "header", reflect: true })
    header?: string[];

    /**
     * Optional entry data, should have the same length liken the
     * header property.
     */
    @property({ type: Object, attribute: "entry-data", reflect: true })
    entryData: string[] = [];

    @property({ type: Number, attribute: "table-index", reflect: true })
    tableIndex: number = -1;

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
        if (this.header !== undefined) {
            // Prepare entry data,
            if (this.header.length > this.entryData.length)
                this.entryData = this.header.map((_, index) => this.entryData[index] || "");
        }

        return html`
            <ui-dialog title="${this.tableIndex < 0 ? "Neuer Eintrag" : "Bearbeiten"}" modal inert>
                <ui-flex-grid gap="0.25rem"> ${this.renderInputs()} </ui-flex-grid>

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
        const content: DirectiveResult<typeof Keyed>[] = [
            ...(this.header || []).map((head, index) => {
                return keyed(
                    this.entryData[index],
                    html`
                        <ui-flex-grid-item>
                            <ui-input
                                title="${head}"
                                type="text"
                                value=${this.entryData[index]}
                                @change=${(ev: Event & { currentTarget: UIInput }) => {
                                    this.entryData[index] = ev.currentTarget.value;
                                }}
                            ></ui-input>
                        </ui-flex-grid-item>
                    `,
                );
            }),
        ];

        return html`${content}`;
    }

    private renderDeleteAction() {
        if (this.tableIndex < 0) return html``;
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
}

export default PGMetalSheetEntryDialog;
