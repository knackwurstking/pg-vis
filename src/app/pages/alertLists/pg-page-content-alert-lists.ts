import { html, PropertyValues, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles, UIIconButton } from "ui";
import PGAlertListItem from "../../../components/pg-alert-list-item";
import PGSearchBar from "../../../components/pg-search-bar";
import { queryTargetFromElementPath } from "../../../lib/query-utils";
import { AlertList } from "../../../store-types";
import PGApp from "../../pg-app";
import PGPageContent from "../pg-page-content";

@customElement("pg-page-content-alert-lists")
class PGPageContentAlertLists extends PGPageContent<AlertList> {
    @property({ type: Boolean, attribute: "search-bar", reflect: true })
    searchBar?: boolean;

    private _onAppBarSearchClick = () => {
        this.searchBar = !this.searchBar;
    };

    public querySearchBar(): PGSearchBar | null {
        return this.querySelector<PGSearchBar>(`pg-search-bar`);
    }

    protected render(): TemplateResult<1> {
        const appBar = PGApp.queryAppBar()!;

        appBar.contentName("title")!.contentAt(0).innerText =
            this.data !== undefined ? this.data.title : "Alarm Liste";

        return html`
            <pg-search-bar
                title="Alarmsuche (RegEx Mode)"
                storage-key="${this.data?.title}"
                ?active=${!!this.searchBar}
                @change=${(ev: Event) => {
                    if (!this.searchBar) return;

                    const value = (ev.currentTarget as PGSearchBar).value();

                    // TODO: Filter...

                    if (value === "") console.debug("disable filters...");
                    else console.debug(`search: "${value}"`);
                }}
            ></pg-search-bar>

            <div
                class="container no-scrollbar"
                style="${styles({
                    width: "100%",
                    height: "100%",
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
        const pgSearchBar = this.querySelector<HTMLElement>(`pg-search-bar`)!;
        const container = this.querySelector<HTMLElement>(`div.container`)!;

        if (this.searchBar) {
            container.style.paddingTop = `calc(${pgSearchBar.clientHeight}px + var(--ui-spacing) * 2)`;
        } else {
            container.style.paddingTop = `0`;
        }
    }

    protected firstUpdated(_changedProperties: PropertyValues): void {
        const appBar = PGApp.queryAppBar()!;

        appBar
            .contentName("search")!
            .contentAt<UIIconButton>(0)
            .addEventListener("click", this._onAppBarSearchClick);

        const container = this.querySelector(`div.list`)!;
        if (this.data !== undefined) {
            this.data.data.forEach(async (alert, index) => {
                const item = new PGAlertListItem();
                item.data = alert;
                item.ripple = true;
                container.appendChild(item);

                if (index < this.data!.data.length - 1) {
                    container.appendChild(document.createElement("hr"));
                }
            });
        }
    }
}

export default PGPageContentAlertLists;
