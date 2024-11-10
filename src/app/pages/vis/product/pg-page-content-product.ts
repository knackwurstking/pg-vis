import { html, PropertyValues } from "lit";
import { customElement } from "lit/decorators.js";

import { nothing } from "lit";
import { UIFlexGridItem } from "ui";
import { Product } from "../../../../store-types";
import PGApp from "../../../pg-app";
import PGPageContent from "../../pg-page-content";
import { PGVisDataListItem } from "../../vis-data";

@customElement("pg-page-contents-product")
class PGPageContentProduct extends PGPageContent<Product> {
    /* TODO: ...
     *  Bookmarks:
     *      - Add this product to a bookmarks list (per dialog or html select)
     *  Edit Mode:
     *      - Checkbox label: "is flakes product"
     *      - Setup flakes product using a template for P4 / P5 or P0
     */

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

                    <ui-flex-grid-row justify="space-between" wrap="warp" gap="0.25rem">
                        <ui-flex-grid-item flex="0">
                            <pg-flakes-action></pg-flakes-action>
                        </ui-flex-grid-item>

                        <ui-flex-grid-item flex="0">
                            <pg-bookmarks-action
                                product="${JSON.stringify(this.data) || ""}"
                            ></pg-bookmarks-action>
                        </ui-flex-grid-item>
                    </ui-flex-grid-row>

                    <ui-flex-grid class="list" direction="column" gap="0.25rem">
                        ${nothing}
                    </ui-flex-grid>
                </ui-flex-grid>
            </div>
        `;
    }

    protected updated(changedProperties: PropertyValues): void {
        if (changedProperties.has("data")) {
            this.updateContent();
        }
    }

    // TODO: Render this data like the vis page component
    private updateContent() {
        if (this.data === undefined) return html``;

        const visData = PGApp.queryStore().getData("visData");
        if (visData === undefined) return html``;

        const container = this.querySelector(`.list`)!;

        let entryIndex = -1;
        for (const list of visData) {
            entryIndex++;

            let hasHeading = false;
            for (const entry of list.data) {
                setTimeout(() => {
                    if (!this.isLotto(entry.lotto, this.data!.lotto)) {
                        return;
                    }

                    if (!this.isFormat(entry.format, this.data!.format)) {
                        return;
                    }

                    if (!this.isStamp(entry.stamp, this.data!.stamp)) {
                        return;
                    }

                    if (!this.isThickness(entry.thickness, this.data!.thickness)) {
                        return;
                    }

                    if (!hasHeading) {
                        hasHeading = true;
                        const item = new UIFlexGridItem();
                        item.innerHTML = `
                            <ui-heading level="3"> ${list.title} </ui-heading>
                        `;
                        container.appendChild(item);
                    }

                    const item = new PGVisDataListItem();
                    item.data = entry;
                    item.entryIndex = entryIndex;
                    container.appendChild(item);
                });
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
