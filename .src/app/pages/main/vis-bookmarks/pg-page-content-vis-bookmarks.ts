import { customElement, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import { nothing, PropertyValues } from "lit";
import { CleanUp, draggable, html } from "ui";

import * as app from "@app";
import * as lib from "@lib";
import * as types from "@types";

@customElement("pg-page-content-vis-bookmarks")
class PGPageContentVisBookmarks extends app.PGPageContent<types.Bookmarks> {
    @state()
    private listItems: unknown = nothing;

    private cleanup = new CleanUp();

    connectedCallback(): void {
        super.connectedCallback();

        // Update content if "visBookmarks" data changes

        const store = app.PGApp.queryStore();
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

    protected render() {
        super.renderListsAppBarTitle("visBookmarks", this.data);

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

        const store = app.PGApp.queryStore();
        this.listItems = repeat(
            this.data.data,
            (bookmarksProduct) => `${bookmarksProduct.lotto} ${bookmarksProduct.name}`,
            (bookmarksProduct) => {
                const product = this.productFromStore(store, bookmarksProduct);
                return html`
                    <pg-vis-list-item
                        class="no-user-select"
                        data=${JSON.stringify(product)}
                        route
                    ></pg-vis-list-item>
                `;
            },
        );

        setTimeout(() => {
            const list = this.querySelector<HTMLElement>(`.list`)!;
            draggable.createMobile(list, {
                onDragEnd: () => {
                    if (this.data === undefined) return;

                    const data = Array.from(list.children)
                        .filter((child) => child instanceof app.PGVisListItem)
                        .map((child) => {
                            return child.data!;
                        });

                    lib.listStore("visBookmarks").replaceInStore(
                        store,
                        { ...this.data, data: data },
                        this.data,
                    );
                },
            });
        });
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
