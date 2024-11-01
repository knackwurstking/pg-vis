import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { UIDialog } from "ui";

/**
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
                    ${[
                        ...(this.header || []).map(
                            (head, index) => html`
                                <ui-flex-grid-item>
                                    <ui-input
                                        title="${head}"
                                        type="text"
                                        value="${this.entryData[index] || ""}"
                                        @change=${() => {
                                            // TODO: Update entry data
                                        }}
                                    ></ui-input>
                                </ui-flex-grid-item>
                            `,
                        ),
                    ]}
                </ui-flex-grid>

                <ui-button
                    slot="actions"
                    variant="full"
                    color="secondary"
                    @click=${async () => this.close()}
                >
                    Cancel
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
                    Submit
                </ui-button>
            </ui-dialog>
        `;
    }

    show() {
        this.querySelector<UIDialog>("ui-dialog")!.show();
    }

    close() {
        this.querySelector<UIDialog>("ui-dialog")!.close();
    }
}

export default PGMetalSheetEntryDialog;
