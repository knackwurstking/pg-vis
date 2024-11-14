import { html, PropertyValues, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";

import * as app from "@app";
import * as lib from "@lib";
import * as types from "@types";

@customElement("pg-page-contents-product")
class PGPageContentProduct extends app.PGPageContent<types.Product> {
    @state()
    private listItems: TemplateResult<1>[] = [];

    protected render() {
        return html`
            <div class="container no-scrollbar" style="width: 100%; height: 100%; overflow: auto;">
                <ui-flex-grid gap="0.25rem">
                    <ui-flex-grid-item>
                        ${this.data !== undefined
                            ? html`<pg-vis-list-item
                                  data=${JSON.stringify(this.data)}
                              ></pg-vis-list-item>`
                            : ""}
                    </ui-flex-grid-item>

                    <ui-flex-grid-row justify="flex-end" wrap="warp" gap="0.25rem">
                        <ui-flex-grid-item flex="0">
                            <pg-bookmarks-action
                                product="${JSON.stringify(this.data) || ""}"
                            ></pg-bookmarks-action>
                        </ui-flex-grid-item>
                    </ui-flex-grid-row>

                    <ui-flex-grid class="list" direction="column" gap="0.25rem">
                        ${this.listItems}
                    </ui-flex-grid>
                </ui-flex-grid>
            </div>
        `;
    }

    protected updated(changedProperties: PropertyValues): void {
        if (changedProperties.has("data")) {
            setTimeout(() => this.updateContent());
        }
    }

    private updateContent() {
        this.listItems = [];
        if (this.data === undefined) return html``;

        const visData = app.PGApp.queryStore().getData("visData");
        if (visData === undefined) return html``;

        const listsStore = lib.listStore("visData");

        for (const list of visData) {
            const listKey = listsStore.listKey(list);

            let hasHeading = false;
            let index = -1;
            for (const entry of list.data) {
                index++;

                if (!this.isLotto(entry.lotto, this.data!.lotto)) {
                    continue;
                }

                if (!this.isFormat(entry.format, this.data!.format)) {
                    continue;
                }

                if (!this.isStamp(entry.stamp, this.data!.stamp)) {
                    continue;
                }

                if (!this.isThickness(entry.thickness, this.data!.thickness)) {
                    continue;
                }

                if (!hasHeading) {
                    hasHeading = true;
                    this.listItems = [
                        ...this.listItems,
                        html`<ui-flex-grid-item>
                            <ui-heading level="3">${list.title}</ui-heading>
                        </ui-flex-grid-item>`,
                    ];
                }

                this.listItems = [
                    ...this.listItems,
                    html`<pg-vis-data-list-item
                        data=${JSON.stringify(entry)}
                        entry-index=${index}
                        list-key=${listKey}
                        route
                    ></pg-vis-data-list-item>`,
                ];
            }
            hasHeading = false;
        }
    }

    private isLotto(match: string | null, lotto: string): boolean {
        if (match === null) return true;

        return new RegExp(match, "i").test(lotto);
    }

    private isFormat(match: string | null, format: string) {
        if (match === null) return true;

        return new RegExp(match, "i").test(format);
    }

    private isStamp(match: string | null, stamp: string) {
        if (match === null) return true;

        return new RegExp(match, "i").test(stamp);
    }

    private isThickness(match: string | null, thickness: number) {
        if (match === null) return true;

        return new RegExp(match, "i").test(thickness.toString());
    }
}

export default PGPageContentProduct;
