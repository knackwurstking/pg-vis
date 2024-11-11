import { html, nothing, PropertyValues } from "lit";
import { customElement } from "lit/decorators.js";
import { UIFlexGridItem } from "ui";
import * as lib from "../../../../lib";
import { Product } from "../../../../store-types";
import PGApp from "../../../pg-app";
import PGPageContent from "../../pg-page-content";
import { PGPageContentVisDataEdit, PGVisDataListItem } from "../../vis-data";

@customElement("pg-page-contents-product")
class PGPageContentProduct extends PGPageContent<Product> {
    protected render() {
        const handleListClick = (ev: Event) => {
            if (!(ev.target instanceof Element) || this.data === undefined) return;

            const target = lib.queryTargetFromElementPath<PGVisDataListItem>(
                ev.target,
                "pg-vis-data-list-item",
            );
            if (target === null) return;

            PGApp.queryStackLayout()!.setPage(
                "visDataEdit",
                (page) => {
                    const content = page.children[0] as PGPageContentVisDataEdit | undefined;

                    if (content !== undefined) {
                        content.data = target.data;
                        content.listKey = target.getAttribute("data-listKey") || undefined;
                        content.entryIndex = target.entryIndex;
                    }
                },
                true,
            );
        };

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

                    <ui-flex-grid
                        class="list"
                        direction="column"
                        gap="0.25rem"
                        @click=${handleListClick}
                    >
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

    private updateContent() {
        if (this.data === undefined) return html``;

        const visData = PGApp.queryStore().getData("visData");
        if (visData === undefined) return html``;

        const container = this.querySelector(`.list`)!;
        const listsStore = lib.listsStore("visData");

        let entryIndex = -1;
        for (const list of visData) {
            entryIndex++;

            const listKey = listsStore.listKey(list);
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
                    item.style.cursor = "pointer";
                    item.role = "button";
                    item.data = entry;
                    item.entryIndex = entryIndex;
                    item.setAttribute("data-listKey", listKey);
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
