import { html, PropertyValues, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { styles } from "ui";
import PGAlertListItem from "../../../components/pg-alert-list-item";
import PGSearchBar from "../../../components/pg-search-bar";
import { query } from "../../../lib";
import { AlertList } from "../../../types";
import PGApp from "../../pg-app";
import PGPageAlert from "../alert/pg-page-alert";
import PGPageBase from "../pg-page-base";

@customElement("pg-page-alert-lists")
class PGPageAlertLists extends PGPageBase<AlertList> {
    name = "alertLists";

    public querySearchBar(): PGSearchBar | null {
        return this.querySelector<PGSearchBar>(`pg-search-bar`);
    }

    protected render(): TemplateResult<1> {
        console.debug(`Render the "pg-page-alert-lists" component`, this);

        PGApp.queryAppBar()!.contentName("title")!.contentAt(0).innerText =
            this.data !== undefined ? this.data.title : "Alarm Liste";

        return html`
            <pg-search-bar
                title="Alarmsuche (RegEx Mode)"
                storage-key="${this.data?.title}"
            ></pg-search-bar>

            <div
                class="no-scrollbar"
                style="${styles({
                    width: "100%",
                    height: "100%",
                    paddingTop:
                        "calc(var(--ui-app-bar-height) + var(--pg-search-bar-height))",
                    overflow: "auto",
                    scrollBehavior: "smooth",
                } as CSSStyleDeclaration)}"
            >
                <ul
                    class="list"
                    @click=${async (ev: MouseEvent): Promise<void> => {
                        if (!(ev?.target instanceof Element)) return;

                        const target =
                            query.targetFromElementPath<PGAlertListItem>(
                                ev.target,
                                `pg-alert-list-item`,
                            );
                        if (target === null) return;

                        PGApp.queryStackLayout()!.setPage(
                            "alert",
                            (page): void => {
                                if (!(page instanceof PGPageAlert)) return;
                                page.data = target.data;
                            },
                            true,
                        );
                    }}
                ></ul>
            </div>
        `;
    }

    protected updated(_changedProperties: PropertyValues): void {
        const ul = this.querySelector(`ui.list`)!;
        if (this.data !== undefined) {
            this.data.data.forEach(async (alert) => {
                const item = new PGAlertListItem();
                item.data = alert;
                ul.appendChild(item);
            });
        }
    }

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }
}

export default PGPageAlertLists;
