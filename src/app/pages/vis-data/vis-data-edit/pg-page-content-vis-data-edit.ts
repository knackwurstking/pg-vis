import { html, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { UIInput } from "ui";
import { newListsStore } from "../../../../lib/lists-store";
import { VisDataEntry } from "../../../../store-types";
import PGApp from "../../../pg-app";
import PGPageContent from "../../pg-page-content";

@customElement("pg-page-content-vis-data-edit")
export class PGPageContentVisDataEdit extends PGPageContent<VisDataEntry> {
    @property({ type: String, attribute: "list-key", reflect: true })
    listKey?: string;

    @property({ type: Number, attribute: "entry-index", reflect: true })
    entryIndex?: number;

    private modified: boolean = false;

    protected render() {
        if (
            this.data === undefined ||
            this.listKey === undefined ||
            this.entryIndex === undefined
        ) {
            return html``;
        }

        return html`
            <ui-flex-grid gap="0.25rem">
                <ui-flex-grid-item>
                    <ui-input
                        name="key"
                        title="Key (Optional)"
                        type="text"
                        value=${this.data.key || ""}
                        @change=${async (
                            ev: Event & { currentTarget: UIInput },
                        ) => {
                            this.data!.key = ev.currentTarget.value || null;
                            this.modified = true;
                        }}
                    ></ui-input>
                </ui-flex-grid-item>

                <ui-flex-grid-item>
                    <ui-textarea
                        name="value"
                        title="Value"
                        type="text"
                        value=${this.data.value || ""}
                        rows="10"
                        @change=${async (
                            ev: Event & { currentTarget: UIInput },
                        ) => {
                            this.data!.value = ev.currentTarget.value;
                            this.modified = true;
                        }}
                    ></ui-textarea>
                </ui-flex-grid-item>

                <ui-flex-grid-item>
                    <ui-input
                        name="lotto"
                        title="Lotto (Filter, Optional)"
                        type="text"
                        value=${this.data.lotto || ""}
                        @change=${async (
                            ev: Event & { currentTarget: UIInput },
                        ) => {
                            this.data!.lotto = ev.currentTarget.value || null;
                            this.modified = true;
                        }}
                    ></ui-input>
                </ui-flex-grid-item>

                <ui-flex-grid-item>
                    <ui-input
                        name="format"
                        title="Format (Filter, Optional)"
                        type="text"
                        value=${this.data.format || ""}
                        @change=${async (
                            ev: Event & { currentTarget: UIInput },
                        ) => {
                            this.data!.format = ev.currentTarget.value || null;
                            this.modified = true;
                        }}
                    ></ui-input>
                </ui-flex-grid-item>

                <ui-flex-grid-item>
                    <ui-input
                        name="stamp"
                        title="Stempel (Filter, Optional)"
                        type="text"
                        value=${this.data.stamp || ""}
                        @change=${async (
                            ev: Event & { currentTarget: UIInput },
                        ) => {
                            this.data!.stamp = ev.currentTarget.value || null;
                            this.modified = true;
                        }}
                    ></ui-input>
                </ui-flex-grid-item>

                <ui-flex-grid-item>
                    <ui-input
                        name="thickness"
                        title="Stärke (Filter, Optional)"
                        type="number"
                        value=${this.data.thickness || ""}
                        @change=${async (
                            ev: Event & { currentTarget: UIInput },
                        ) => {
                            this.data!.thickness =
                                ev.currentTarget.value || null;
                            this.modified = true;
                        }}
                    ></ui-input>
                </ui-flex-grid-item>
            </ui-flex-grid>
        `;
    }

    protected firstUpdated(_changedProperties: PropertyValues): void {
        super.firstUpdated(_changedProperties);

        const store = PGApp.queryStore();
        const stack = PGApp.queryStackLayout()!;
        const cleanup = stack.events.addListener("change", () => {
            cleanup();

            store.updateData("visData", (data) => {
                if (
                    !this.modified ||
                    this.data === undefined ||
                    this.listKey === undefined ||
                    this.entryIndex === undefined
                ) {
                    return data;
                }

                const listsStore = newListsStore("visData");
                for (const list of data) {
                    if (listsStore.listKey(list) === this.listKey) {
                        if (this.entryIndex < 0) {
                            list.data.unshift(this.data);
                        } else {
                            list.data[this.entryIndex] = this.data;
                        }

                        break;
                    }
                }

                return data;
            });
        });
    }
}

export default PGPageContentVisDataEdit;
