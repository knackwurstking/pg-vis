import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { CleanUp, styles } from "ui";
import { newListsStore } from "../../../lib/lists-store";
import { queryTargetFromElementPath } from "../../../lib/query-utils";
import { VisData } from "../../../store-types";
import PGApp from "../../pg-app";
import PGPageContent from "../pg-page-content";
import PGVisDataListItem from "./pg-vis-data-list-item";
import PGPageContentVisDataEdit from "./vis-data-edit/pg-page-content-vis-data-edit";
import { keyed } from "lit/directives/keyed.js";

@customElement("pg-page-content-vis-data")
export class PGPageContentVisData extends PGPageContent<VisData> {
    private cleanup = new CleanUp();

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
                            if (
                                !(ev.target instanceof Element) ||
                                this.data === undefined
                            )
                                return;

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
                                        | PGPageContentVisDataEdit
                                        | undefined;

                                    if (content !== undefined) {
                                        content.data = target.data;

                                        content.listKey = newListsStore(
                                            "visData",
                                        ).listKey(this.data!);

                                        content.entryIndex = target.entryIndex;
                                    }
                                },
                                true,
                            );
                        }}
                    >
                        ${this.renderData()}
                    </div>
                </ui-flex-grid-item>
            </ui-flex-grid>
        `;
    }

    private renderData() {
        if (this.data === undefined) return html``;

        const content = this.data.data.map((entry, index) => {
            return keyed(
                entry,
                html`<pg-vis-data-list-item
                    style="cursor: pointer;"
                    data="${JSON.stringify(entry)}"
                    entry-index=${index}
                    show-filter
                ></pg-vis-data-list-item>`,
            );
        });

        return html`${content}`;

        //setTimeout(() => {
        //    if (this.data === undefined) return;

        //    const container = this.querySelector(`.list`)!;

        //    const childsToKick: Element[] = [];
        //    let currentIndex: number = -1;
        //    [...container.children].forEach((child, index) => {
        //        if (!(child instanceof PGVisDataListItem)) return;
        //        if (this.data!.data[index] === undefined) {
        //            childsToKick.push(child);
        //            return;
        //        }
        //        currentIndex = index;

        //        setTimeout(() => {
        //            child.data = this.data!.data[index];
        //            child.entryIndex = index;
        //            child.showFilter = true;
        //        });
        //    });

        //    childsToKick.forEach((child) => container.removeChild(child));

        //    currentIndex++;
        //    this.data.data.slice(currentIndex).forEach((entry, index) => {
        //        setTimeout(() => {
        //            const item = new PGVisDataListItem();
        //            item.style.cursor = "pointer";
        //            item.role = "button";
        //            item.data = entry;
        //            item.entryIndex = index;
        //            item.showFilter = true;
        //            container.appendChild(item);
        //        });
        //    });
        //});
    }

    connectedCallback(): void {
        super.connectedCallback();

        const listsStore = newListsStore("visData");
        const store = PGApp.queryStore();
        this.cleanup.add(
            store.addListener("visData", (data) => {
                for (const list of data) {
                    if (
                        listsStore.listKey(list) ===
                        listsStore.listKey(this.data!)
                    ) {
                        console.debug("update...");
                        this.data = list;
                        return;
                    }
                }
            }),
        );
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.cleanup.run();
    }
}

export default PGPageContentVisData;
