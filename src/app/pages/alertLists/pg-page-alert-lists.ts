import { html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { styles } from "ui";
import PGSearchBar from "../../../components/pg-search-bar";
import { query } from "../../../lib";
import PGApp from "../../pg-app";
import PGPageAlert from "../alert/pg-page-alert";
import PGPageBase from "../pg-page-base";
import { Alert, AlertList } from "../../../types";

@customElement("pg-page-alert-lists")
class PGPageAlertLists extends PGPageBase<AlertList> {
    name = "alertLists";

    public querySearchBar(): PGSearchBar | null {
        return this.querySelector<PGSearchBar>(`pg-search-bar`);
    }

    protected render(): TemplateResult<1> {
        console.debug(`Render the "pg-page-alert-lists" component`);

        PGApp.queryAppBar()!.contentName("title")!.contentAt(0).innerText =
            this.data !== undefined ? "" : "Alarm Liste";

        // TODO: Parse and set data here...
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

                        const target = query.targetFromElementPath(
                            ev.target,
                            `.alert-item`,
                        );
                        if (!target) return;

                        const data = JSON.parse(
                            target.getAttribute(`data-json`) || "null",
                        ) as Alert | null;
                        if (data === null) return;

                        PGApp.queryStackLayout()!.set(
                            "alert",
                            (page): void => {
                                if (!(page instanceof PGPageAlert)) return;
                                page.data = data;
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
