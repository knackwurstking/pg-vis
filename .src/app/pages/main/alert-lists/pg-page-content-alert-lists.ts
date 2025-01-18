import { customElement, property, state } from "lit/decorators.js";

import { html, PropertyValues, TemplateResult } from "lit";
import { CleanUp, styles, UIIconButton } from "ui";

import * as app from "@app";
import * as types from "@types";

@customElement("pg-page-content-alert-lists")
class PGPageContentAlertLists extends app.PGPageContent<types.AlertList> {
    @property({ type: Boolean, attribute: "search-bar", reflect: true })
    searchBar?: boolean;

    @state()
    private listItems: TemplateResult<1>[] = [];

    private cleanup = new CleanUp();

    connectedCallback(): void {
        super.connectedCallback();

        // App Bar Events

        const appBar = app.PGApp.queryAppBar()!;

        const onClick = async () => (this.searchBar = !this.searchBar);

        const appBarSearchButton = appBar.contentName("search")!.contentAt<UIIconButton>(0);

        appBarSearchButton.addEventListener("click", onClick);

        this.cleanup.add(() => appBarSearchButton.removeEventListener("click", onClick));
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.cleanup.run();
    }

    protected render(): TemplateResult<1> {
        super.renderListsAppBarTitle("alertLists", this.data);

        return html`
            <pg-search-bar
                title="Alarmsuche"
                storage-key="${this.data?.title}"
                ?active=${!!this.searchBar}
                @change=${async (ev: Event & { currentTarget: app.PGSearchBar }) => {
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
                <div class="list">${this.listItems}</div>
            </div>
        `;
    }

    protected updated(changedProperties: PropertyValues): void {
        const pgSearchBar = this.querySelector<app.PGSearchBar>(`pg-search-bar`)!;
        const container = this.querySelector<HTMLElement>(`div.container`)!;

        if (this.searchBar) {
            container.style.paddingTop = `calc(${pgSearchBar.clientHeight}px + var(--ui-spacing) * 2)`;
            this.filter(pgSearchBar.value());
        } else {
            container.style.paddingTop = `0`;
            this.filter("");
        }

        if (changedProperties.has("data")) {
            setTimeout(() => this.updateContent());
        }
    }

    private updateContent() {
        this.listItems = [];
        if (this.data === undefined) return;

        this.listItems = this.data.data.map((alert) => {
            return html`<pg-alert-list-item
                data=${JSON.stringify(alert)}
                route
            ></pg-alert-list-item>`;
        });
    }

    private async filter(value: string) {
        const container = this.querySelector(`.list`)!;
        const regex: RegExp = app.PGSearchBar.generateRegExp(value);

        let alertNumberStrings: string[];
        let searchString: string;
        let from: number;
        let to: number;
        for (const child of [...container.children] as app.PGAlertListItem[]) {
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
