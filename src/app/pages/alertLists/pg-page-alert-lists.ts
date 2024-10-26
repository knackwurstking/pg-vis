import { html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { styles, UIStackLayoutPage } from "ui";
import PGApp from "../../pg-app";
import { query } from "../../../lib";

@customElement("pg-page-alert-lists")
class PGPageAlertLists extends UIStackLayoutPage {
    name = "alertLists";

    public querySearchBar(): PGSearchBar | null {
        return this.querySelector<PGSearchBar>(`pg-search-bar`);
    }

    protected render(): TemplateResult<1> {
        return html`
            <!-- TODO: Add "PGSearchBar" component -->
            <pg-search-bar title="Alarmsuche (RegEx Mode)"></pg-search-bar>

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

                        const stack = PGApp.queryStackLayout();
                        if (!stack) return;

                        const target = query.targetFromElementPath(
                            ev.target,
                            `.alert-item`,
                        );
                        if (!target) return;

                        const data = target.getAttribute(`data-json`);
                        if (!data) return;

                        stack.set(
                            "alert",
                            (page: PGPageAlert) => {
                                page.setData(data);
                            },
                            true,
                        );
                    }}
                ></ul>
            </div>
        `;
    }

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }
}

export default PGPageAlertLists;
