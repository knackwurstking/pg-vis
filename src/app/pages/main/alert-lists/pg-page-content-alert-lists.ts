import { html, PropertyValues, TemplateResult } from "lit";
import { DirectiveResult } from "lit/async-directive.js";
import { customElement, property } from "lit/decorators.js";
import { keyed, Keyed } from "lit/directives/keyed.js";
import { CleanUp, styles, UIIconButton } from "ui";

import * as lib from "../../../../lib";
import { Alert, AlertList } from "../../../../store-types";
import { PGSearchBar } from "../../../components";
import { PGAlertListItem } from "../../../list-items";
import PGApp from "../../../pg-app";
import PGPageContent from "../../pg-page-content";

@customElement("pg-page-content-alert-lists")
class PGPageContentAlertLists extends PGPageContent<AlertList> {
    @property({ type: Boolean, attribute: "search-bar", reflect: true })
    searchBar?: boolean;

    private cleanup = new CleanUp();
    private content: DirectiveResult<typeof Keyed>[] = [];

    public querySearchBar(): PGSearchBar | null {
        return this.querySelector<PGSearchBar>(`pg-search-bar`);
    }

    protected render(): TemplateResult<1> {
        PGApp.queryAppBar()!.contentName("title")!.contentAt(0).innerText =
            this.data !== undefined
                ? lib.listsStore("alertLists").listKey(this.data)
                : lib.listsStore("alertLists").title();

        return html`
            <pg-search-bar
                title="Alarmsuche"
                storage-key="${this.data?.title}"
                ?active=${!!this.searchBar}
                @change=${async (ev: Event & { currentTarget: PGSearchBar }) => {
                    await this.filter(ev.currentTarget.value());
                }}
            ></pg-search-bar>

            <div
                class="container no-scrollbar"
                style="${styles({
                    width: "100%",
                    height: "100%",
                    overflow: "auto",
                } as CSSStyleDeclaration)}"
            >
                <div
                    class="list"
                    @click=${async (ev: MouseEvent): Promise<void> => {
                        if (!(ev.target instanceof Element)) return;

                        const target = lib.queryTargetFromElementPath<PGAlertListItem>(
                            ev.target,
                            `pg-alert-list-item`,
                        );
                        if (target === null) return;

                        PGApp.queryStackLayout()!.setPage(
                            "alert",
                            (page): void => {
                                const content = page.children[0] as
                                    | PGPageContent<Alert>
                                    | undefined;

                                if (content !== undefined) {
                                    content.data = target.data;
                                }
                            },
                            true,
                        );
                    }}
                >
                    ${this.content}
                </div>
            </div>
        `;
    }

    protected updated(changedProperties: PropertyValues): void {
        const pgSearchBar = this.querySelector<PGSearchBar>(`pg-search-bar`)!;
        const container = this.querySelector<HTMLElement>(`div.container`)!;

        if (this.searchBar) {
            container.style.paddingTop = `calc(${pgSearchBar.clientHeight}px + var(--ui-spacing) * 2)`;
            this.filter(pgSearchBar.value());
        } else {
            container.style.paddingTop = `0`;
            this.filter("");
        }

        if (changedProperties.has("data")) {
            setTimeout(() => {
                this.content = [];
                (this.data?.data || []).forEach(async (alert) => {
                    setTimeout(() => {
                        this.content.push(
                            keyed(
                                alert,
                                html`<pg-alert-list-item
                                    role="button"
                                    style="cursor: pointer;"
                                    data=${JSON.stringify(alert)}
                                ></pg-alert-list-item>`,
                            ),
                        );
                    });
                });

                setTimeout(() => this.requestUpdate());
            });
        }
    }

    connectedCallback(): void {
        super.connectedCallback();

        // App Bar Events

        const appBar = PGApp.queryAppBar()!;

        const onClick = async () => (this.searchBar = !this.searchBar);

        const appBarSearchButton = appBar.contentName("search")!.contentAt<UIIconButton>(0);

        appBarSearchButton.addEventListener("click", onClick);

        this.cleanup.add(() => appBarSearchButton.removeEventListener("click", onClick));
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.cleanup.run();
    }

    public async filter(value: string) {
        const container = this.querySelector(`.list`)!;
        const regex: RegExp = PGSearchBar.generateRegExp(value);

        let alertNumberStrings: string[];
        let searchString: string;
        let from: number;
        let to: number;
        for (const child of [...container.children] as PGAlertListItem[]) {
            if (child.data === undefined) continue;

            setTimeout(() => {
                from = Math.min(child.data!.from, child.data!.to);
                to = Math.max(child.data!.from, child.data!.to);
                alertNumberStrings = [];
                for (let n = from; n < to; n++) {
                    alertNumberStrings.push(n.toString());
                }

                searchString = `${alertNumberStrings.join(",")} ${child.data!.alert}`;
                if (regex.test(searchString)) {
                    child.style.display = "flex";
                } else {
                    child.style.display = "none";
                }
            });
        }
    }
}

export default PGPageContentAlertLists;
