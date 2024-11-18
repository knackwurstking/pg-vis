import { DirectiveResult } from "lit/async-directive.js";
import { customElement, state } from "lit/decorators.js";
import { Keyed, keyed } from "lit/directives/keyed.js";

import { html, PropertyValues } from "lit";
import { CleanUp } from "ui";

import * as app from "@app";
import * as lib from "@lib";
import * as types from "@types";

@customElement("pg-page-contents-product")
class PGPageContentProduct extends app.PGPageContent<types.Product> {
    @state()
    private listItems: DirectiveResult<typeof Keyed>[] = [];

    private cleanup = new CleanUp();

    connectedCallback(): void {
        super.connectedCallback();

        const store = app.PGApp.queryStore();

        this.cleanup.add(
            store.addListener("visData", () => {
                this.updateContent();
            }),
        );
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.cleanup.run();
    }

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

        const listsStore = lib.listStore("visData");
        for (const list of app.PGApp.queryStore().getData("visData") || []) {
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
                        keyed(
                            list.title,
                            html`<ui-flex-grid-item>
                                <ui-heading level="3">${list.title}</ui-heading>
                            </ui-flex-grid-item>`,
                        ),
                    ];
                }

                const data = JSON.stringify(entry);
                this.listItems = [
                    ...this.listItems,
                    keyed(
                        data,
                        html`<pg-vis-data-list-item
                            data=${data}
                            entry-index=${index}
                            list-key=${listKey}
                            route
                        ></pg-vis-data-list-item>`,
                    ),
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
