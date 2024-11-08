import { customElement } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";
import { html } from "ui";

import { PGPageContent, PGVisListItem } from "..";

import { PGApp } from "../..";

import { newListsStore } from "../../../lib/lists-store";
import { queryTargetFromElementPath } from "../../../lib/query-utils";

import { Bookmarks, PGStore, Product, Vis } from "../../../store-types";

@customElement("pg-page-content-vis-bookmarks")
class PGPageContentVisBookmarks extends PGPageContent<Bookmarks> {
    protected render() {
        PGApp.queryAppBar()!.contentName("title")!.contentAt(0).innerText =
            this.data !== undefined
                ? newListsStore("visBookmarks").listKey(this.data)
                : newListsStore("visBookmarks").title();

        const listClickHandler = (ev: Event & { currentTarget: HTMLElement }) => {
            if (!(ev.target instanceof Element)) return;

            const target = queryTargetFromElementPath<PGVisListItem>(ev.target, "pg-vis-list-item");
            if (target === null) return;

            PGApp.queryStackLayout()!.setPage(
                "product",
                (page) => {
                    const content = page.children[0] as PGPageContent<Product> | undefined;
                    if (content !== undefined) {
                        content.data = target.data;
                    }
                },
                true,
            );
        }

        return html`
            <div
                class="container no-scrollbar"
                style="width: 100%; height: 100%; overflow: auto;"
            >
                <div class="list" @click=${listClickHandler}>
                    ${this.renderData()}
                </div>
            </div>
        `;
    }

    private renderData() {
        if (this.data === undefined) return html``

        const store = PGApp.queryStore()

        const content = []
        for (let product of this.data.data) {
            product = this.productFromStore(store, product)
            content.push(keyed(product, html`
                <pg-vis-list-item data="${JSON.stringify(product)}"></pg-vis-list-item>
            `))
        }

        return html`${content}`;
    }

    private productFromStore(store: PGStore, product: Product): Product {
        const productKey = `${product.lotto} ${product.name}`
        for (const list of this.sortVisLists(store.getData("vis") || [])) {
            console.debug(`Search list "${list.title}" for the product key "${productKey}"`)
            for (const listProduct of list.data) {
                if (`${listProduct.lotto} ${listProduct.name}` === productKey) {
                    console.debug(`Found "${productKey}" in "${list.title}"`)
                    return product
                }
            }
        }

        console.warn(`Product key "${productKey}" not found`)
        return product
    }

    private sortVisLists(lists: Vis[]): Vis[] {
        return lists.sort((a, b) => a.date - b.date).reverse()
    }
}

export default PGPageContentVisBookmarks;
