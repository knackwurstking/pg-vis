import { PropertyValues } from "lit";
import { DirectiveResult } from "lit/async-directive.js";
import { customElement } from "lit/decorators.js";
import { Keyed, keyed } from "lit/directives/keyed.js";
import { html } from "ui";

import { PGPageContent, PGVisListItem } from "..";
import { PGApp } from "../..";
import { queryTargetFromElementPath } from "../../../lib/query-utils";
import * as utils from "../../../lib/utils";
import { Bookmarks, PGStore, Product, Vis } from "../../../store-types";

@customElement("pg-page-content-vis-bookmarks")
class PGPageContentVisBookmarks extends PGPageContent<Bookmarks> {
    private content: DirectiveResult<typeof Keyed>[] = [];

    protected render() {
        PGApp.queryAppBar()!.contentName("title")!.contentAt(0).innerText =
            this.data !== undefined
                ? utils.listsStore("visBookmarks").listKey(this.data)
                : utils.listsStore("visBookmarks").title();

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
        };

        return html`
            <div class="container no-scrollbar" style="width: 100%; height: 100%; overflow: auto;">
                <div class="list" @click=${listClickHandler}>${this.content}</div>
            </div>
        `;
    }

    protected updated(changedProperties: PropertyValues): void {
        if (changedProperties.has("data")) {
            setTimeout(() => {
                const store = PGApp.queryStore();
                this.content = [];
                (this.data?.data || []).forEach(async (product) => {
                    setTimeout(() => {
                        product = this.productFromStore(store, product);
                        this.content.push(
                            keyed(
                                product,
                                html`<pg-vis-list-item
                                    role="button"
                                    style="cursor: pointer;"
                                    data="${JSON.stringify(product)}"
                                ></pg-vis-list-item>`,
                            ),
                        );
                    });
                });

                setTimeout(() => this.requestUpdate());
            });
        }
    }

    private productFromStore(store: PGStore, product: Product): Product {
        const productKey = `${product.lotto} ${product.name}`;

        for (const list of this.sortVisLists(store.getData("vis") || [])) {
            console.debug(`Search list "${list.title}" for the product key "${productKey}"`);

            for (const listProduct of list.data) {
                if (`${listProduct.lotto} ${listProduct.name}` === productKey) {
                    console.debug(`Found "${productKey}" in "${list.title}"`);
                    return product;
                }
            }
        }

        console.warn(`Product key "${productKey}" not found`);
        return product;
    }

    private sortVisLists(lists: Vis[]): Vis[] {
        return lists.sort((a, b) => a.date - b.date).reverse();
    }
}

export default PGPageContentVisBookmarks;
