import { customElement, property } from "lit/decorators.js";
import PGPageContent from "../pg-page-content";
import { html, PropertyValues } from "lit";
import { Vis } from "../../../store-types";
import PGSearchBar from "../../../components/pg-search-bar";
import { CleanUp, styles, UIIconButton } from "ui";
import PGApp from "../../pg-app";

@customElement("pg-page-content-vis")
class PGPageContentVis extends PGPageContent<Vis> {
    @property({ type: Boolean, attribute: "search-bar", reflect: true })
    searchBar?: boolean;

    private cleanup = new CleanUp();

    protected render() {
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
                        // TODO: Get the "pg-vis-list-item" from target
                        //       elements path
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
        // TODO: Render items to the ".list" here...
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

    async filter(value: string) {
        throw new Error("Method not implemented.");
    }
}

export default PGPageContentVis;
