import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { UIDialog, UIInput } from "ui";

/**
 * This dialog will reset all properties after each close dialog call
 *
 * @fires submit
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

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    protected render() {
        if (this.header !== undefined) {
            // Prepare entry data,
            if (this.header.length > this.entryData.length)
                this.entryData = this.header.map(
                    (_, index) => this.entryData[index] || "",
                );
        }

        return html`
            <ui-dialog name="entry" title="Eintrag Bearbeiten" modal inert>
                <ui-flex-grid gap="0.25rem">
                    ${this.renderInputs()}
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

    private renderInputs() {
        const content: TemplateResult<1>[] = [
            ...(this.header || []).map((head, index) => {
                return html`
                    <ui-flex-grid-item>
                        <ui-input
                            title="${head}"
                            type="text"
                            value=${this.entryData[index]}
                            @change=${(
                                ev: Event & { currentTarget: UIInput },
                            ) => {
                                this.entryData[index] = ev.currentTarget.value;
                            }}
                        ></ui-input>
                    </ui-flex-grid-item>
                `;
            }),
        ];

        return html`${content}`;
    }

    show() {
        this.querySelector<UIDialog>("ui-dialog")!.show();
    }

    close() {
        setTimeout(() => {
            // Reset component after each close
            this.header = undefined;
            this.entryData = [];
            this.tableIndex = -1;
        });
        this.querySelector<UIDialog>("ui-dialog")!.close();
    }
}

export default PGMetalSheetEntryDialog;
