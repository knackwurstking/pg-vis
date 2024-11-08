import { html, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { CleanUp, styles, UIIconButton } from "ui";
import { PGVisListItem } from ".";
import { PGPageContent } from "..";
import { PGApp } from "../..";
import { newListsStore } from "../../../lib/lists-store";
import { queryTargetFromElementPath } from "../../../lib/query-utils";
import { Product, Vis } from "../../../store-types";
import { PGSearchBar } from "../../components";

@customElement("pg-page-content-vis")
class PGPageContentVis extends PGPageContent<Vis> {
    @property({ type: Boolean, attribute: "search-bar", reflect: true })
    searchBar?: boolean;

    private cleanup = new CleanUp();

    protected render() {
        PGApp.queryAppBar()!.contentName("title")!.contentAt(0).innerText =
            this.data !== undefined
                ? newListsStore("vis").listKey(this.data)
                : "Vis";

        /* TODO:
         *  - Add some special flakes marker
         */

        return html`
            <pg-search-bar
                title="Productsuche (RegEx Mode)"
                storage-key="${this.data?.title}"
                ?active=${!!this.searchBar}
                @change=${async (
                    ev: Event & { currentTarget: PGSearchBar },
                ) => {
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
                    @click=${async (ev: Event) => {
                        if (!(ev.target instanceof Element)) return;

                        const target =
                            queryTargetFromElementPath<PGVisListItem>(
                                ev.target,
                                "pg-vis-list-item",
                            );
                        if (target === null) return;

                        PGApp.queryStackLayout()!.setPage(
                            "product",
                            (page) => {
                                const content = page.children[0] as
                                    | PGPageContent<Product>
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
        const pgSearchBar = this.querySelector<PGSearchBar>(`pg-search-bar`)!;
        const container = this.querySelector<HTMLElement>(`div.container`)!;

        if (this.searchBar) {
            container.style.paddingTop = `calc(${pgSearchBar.clientHeight}px + var(--ui-spacing) * 2)`;
            this.filter(pgSearchBar.value());
        } else {
            container.style.paddingTop = `0`;
            this.filter("");
        }
    }

    protected firstUpdated(_changedProperties: PropertyValues): void {
        setTimeout(() => {
            if (this.data === undefined) return;

            const container = this.querySelector(`.list`)!;
            this.data.data.forEach((product) => {
                setTimeout(() => {
                    const item = new PGVisListItem();
                    item.style.cursor = "pointer";
                    item.role = "button";
                    item.data = product;
                    container.appendChild(item);
                });
            });
        });
    }

    connectedCallback(): void {
        super.connectedCallback();

        // App Bar Events

        const appBar = PGApp.queryAppBar()!;

        const onClick = async () => (this.searchBar = !this.searchBar);

        const appBarSearchButton = appBar
            .contentName("search")!
            .contentAt<UIIconButton>(0);

        appBarSearchButton.addEventListener("click", onClick);

        this.cleanup.add(() =>
            appBarSearchButton.removeEventListener("click", onClick),
        );
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.cleanup.run();
    }

    public async filter(value: string) {
        const container = this.querySelector(`.list`)!;
        const regex: RegExp = PGSearchBar.generateRegExp(value);

        let searchString: string;
        for (const child of [...container.children] as PGVisListItem[]) {
            if (child.data === undefined) continue;

            setTimeout(() => {
                searchString = `${child.data!.lotto} ${child.data!.name} ${child.data!.format} ${child.data!.stamp} ${child.data!.thickness}`;

                if (regex.test(searchString)) {
                    child.style.display = "block";
                } else {
                    child.style.display = "none";
                }
            });
        }
    }
}

export default PGPageContentVis;
