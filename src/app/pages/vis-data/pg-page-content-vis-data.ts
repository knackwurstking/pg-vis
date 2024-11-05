import { html, PropertyValues } from "lit";
import { customElement } from "lit/decorators.js";
import { styles } from "ui";
import { newListsStore } from "../../../lib/lists-store";
import { queryTargetFromElementPath } from "../../../lib/query-utils";
import { VisData, VisDataEntry } from "../../../store-types";
import PGApp from "../../pg-app";
import PGPageContent from "../pg-page-content";
import PGVisDataListItem from "./pg-vis-data-list-item";

@customElement("pg-page-content-vis-data")
export class PGPageContentVisData extends PGPageContent<VisData> {
    protected render() {
        PGApp.queryAppBar()!.contentName("title")!.contentAt(0).innerText =
            this.data !== undefined
                ? newListsStore("visData").listKey(this.data)
                : "Vis Data";

        return html`
            <ui-flex-grid gap="0.25rem">
                <ui-flex-grid-row justify="flex-end" gap="0.25rem">
                    <ui-flex-grid-item flex="0">
                        <ui-button
                            name="new-entry"
                            style="text-wrap: nowrap;"
                            variant="full"
                            color="primary"
                        >
                            Neuer Eintrag
                        </ui-button>
                    </ui-flex-grid-item>
                </ui-flex-grid-row>

                <ui-flex-grid-item>
                    <div
                        class="list no-scrollbar"
                        style="${styles({
                            width: "100%",
                            height: "100%",
                            overflow: "auto",
                        } as CSSStyleDeclaration)}"
                        @click=${async (ev: Event) => {
                            if (!(ev.target instanceof Element)) return;

                            const target =
                                queryTargetFromElementPath<PGVisDataListItem>(
                                    ev.target,
                                    "pg-vis-data-list-item",
                                );
                            if (target === null) return;

                            PGApp.queryStackLayout()!.setPage(
                                "visDataEdit",
                                (page) => {
                                    const content = page.children[0] as
                                        | PGPageContent<VisDataEntry>
                                        | undefined;

                                    if (content !== undefined) {
                                        content.data = target.data;
                                    }
                                },
                                true,
                            );
                        }}
                    ></div>
                </ui-flex-grid-item>
            </ui-flex-grid>
        `;
    }

    protected firstUpdated(_changedProperties: PropertyValues): void {
        setTimeout(() => {
            if (this.data === undefined) return;

            const container = this.querySelector(`.list`)!;
            this.data.data.forEach((entry) => {
                setTimeout(() => {
                    const item = new PGVisDataListItem();
                    item.style.cursor = "pointer";
                    item.role = "button";
                    item.data = entry;
                    item.showFilter = true;
                    container.appendChild(item);
                });
            });
        });
    }
}

export default PGPageContentVisData;
