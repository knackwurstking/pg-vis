import { html, PropertyValues, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { styles } from "ui";
import PGAlertListItem from "../../../components/pg-alert-list-item";
import PGSearchBar from "../../../components/pg-search-bar";
import { AlertList } from "../../../store-types";
import PGApp from "../../pg-app";
import PGPageContent from "../pg-page-content";
import { queryTargetFromElementPath } from "../../../lib/query";

const searchBarHeight = "4.5rem";
const initialSearchBarHeight = "0";

@customElement("pg-page-content-alert-lists")
class PGPageContentAlertLists extends PGPageContent<AlertList> {
    name = "alertLists";

    public querySearchBar(): PGSearchBar | null {
        return this.querySelector<PGSearchBar>(`pg-search-bar`);
    }

    protected render(): TemplateResult<1> {
        console.debug(`Render component`, this);

        PGApp.queryAppBar()!.contentName("title")!.contentAt(0).innerText =
            this.data !== undefined ? this.data.title : "Alarm Liste";

        return html`
            <pg-search-bar
                title="Alarmsuche (RegEx Mode)"
                storage-key="${this.data?.title}"
                height="${searchBarHeight}"
                @open=${() => {
                    this.style.setProperty(
                        `--_search-bar-height`,
                        searchBarHeight,
                    );
                }}
                @close=${() => {
                    this.style.setProperty(`--_search-bar-height`, "0");
                }}
            ></pg-search-bar>

            <div
                class="no-scrollbar"
                style="${styles({
                    width: "100%",
                    height: "100%",
                    paddingTop: `calc(var(--ui-app-bar-height) + var(--_search-bar-height, ${initialSearchBarHeight}))`,
                    overflow: "auto",
                    scrollBehavior: "smooth",
                } as CSSStyleDeclaration)}"
            >
                <div
                    class="list"
                    @click=${async (ev: MouseEvent): Promise<void> => {
                        if (!(ev?.target instanceof Element)) return;

                        const target =
                            queryTargetFromElementPath<PGAlertListItem>(
                                ev.target,
                                `pg-alert-list-item`,
                            );
                        if (target === null) return;

                        PGApp.queryStackLayout()!.setPage(
                            "alert",
                            (page): void => {
                                const content = page.children[0] as
                                    | PGPageContent<any>
                                    | undefined;

                                if (content !== undefined) {
                                    content.data = target.data;
                                }
                            },
                            true,
                        );
                    }}
                ></div>
            </div>
        `;
    }

    protected updated(_changedProperties: PropertyValues): void {
        const ul = this.querySelector(`div.list`)!;
        if (this.data !== undefined) {
            this.data.data.forEach(async (alert, index) => {
                const item = new PGAlertListItem();
                item.data = alert;
                item.ripple = true;
                ul.appendChild(item);

                if (index < this.data!.data.length - 1) {
                    ul.appendChild(document.createElement("hr"));
                }
            });
        }
    }
}

export default PGPageContentAlertLists;
