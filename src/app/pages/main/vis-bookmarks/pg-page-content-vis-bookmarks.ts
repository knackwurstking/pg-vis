import { PropertyValues, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { CleanUp, html } from "ui";

import * as lib from "../../../../lib";
import * as types from "../../../../types";

import PGApp from "../../../pg-app";
import PGPageContent from "../../pg-page-content";

@customElement("pg-page-content-vis-bookmarks")
class PGPageContentVisBookmarks extends PGPageContent<types.Bookmarks> {
    @state()
    private listItems: TemplateResult<1>[] = [];

    private cleanup = new CleanUp();

    protected render() {
        PGApp.queryAppBar()!.contentName("title")!.contentAt(0).innerText =
            this.data !== undefined
                ? lib.listStore("visBookmarks").listKey(this.data)
                : lib.listStore("visBookmarks").title();

        return html`
            <div class="container no-scrollbar" style="width: 100%; height: 100%; overflow: auto;">
                <div class="list">${this.listItems}</div>
            </div>
        `;
    }

    protected updated(changedProperties: PropertyValues): void {
        if (changedProperties.has("data")) {
            setTimeout(() => this.updateContent());
        }
    }

    private updateContent() {
        this.listItems = [];
        if (this.data === undefined) return;

        const store = PGApp.queryStore();
        this.listItems = this.data.data.map((bookmarksProduct) => {
            return html`
                <pg-vis-list-item
                    data=${JSON.stringify(this.productFromStore(store, bookmarksProduct))}
                    route
                >
                </pg-vis-list-item>
            `;
        });
    }

    connectedCallback(): void {
        super.connectedCallback();

        // Update content if "visBookmarks" data changes

        const store = PGApp.queryStore();
        const listsStore = lib.listStore("visBookmarks");

        this.cleanup.add(
            store.addListener("visBookmarks", (data) => {
                if (this.data === undefined) return;

                const listKey = listsStore.listKey(this.data);

                for (const list of data) {
                    if (listsStore.listKey(list) === listKey) {
                        this.data = list;
                        break;
                    }
                }
            }),
        );
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.cleanup.run();
    }

    private productFromStore(store: types.PGStore, product: types.Product): types.Product {
        const productKey = lib.productKey(product);

        for (const list of this.sortVisLists(store.getData("vis") || [])) {
            console.debug(`Search list "${list.title}" for the product key "${productKey}"`);

            for (const listProduct of list.data) {
                if (lib.productKey(listProduct) === productKey) {
                    console.debug(`Found "${productKey}" in "${list.title}"`);
                    return product;
                }
            }
        }

        console.warn(`Product key "${productKey}" not found`);
        return product;
    }

    private sortVisLists(lists: types.Vis[]): types.Vis[] {
        return lists.sort((a, b) => a.date - b.date).reverse();
    }
}

export default PGPageContentVisBookmarks;
