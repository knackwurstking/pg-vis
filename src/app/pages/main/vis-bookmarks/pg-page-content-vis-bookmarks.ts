import { PropertyValues } from "lit";
import { DirectiveResult } from "lit/async-directive.js";
import { customElement } from "lit/decorators.js";
import { Keyed, keyed } from "lit/directives/keyed.js";
import { html } from "ui";

import * as lib from "../../../../lib";
import { Bookmarks, PGStore, Product, Vis } from "../../../../store-types";
import PGApp from "../../../pg-app";
import PGPageContent from "../../pg-page-content";

@customElement("pg-page-content-vis-bookmarks")
class PGPageContentVisBookmarks extends PGPageContent<Bookmarks> {
    private content: DirectiveResult<typeof Keyed>[] = [];

    protected render() {
        PGApp.queryAppBar()!.contentName("title")!.contentAt(0).innerText =
            this.data !== undefined
                ? lib.listsStore("visBookmarks").listKey(this.data)
                : lib.listsStore("visBookmarks").title();

        return html`
            <div class="container no-scrollbar" style="width: 100%; height: 100%; overflow: auto;">
                <div class="list">${this.content}</div>
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
                                    route
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

    private sortVisLists(lists: Vis[]): Vis[] {
        return lists.sort((a, b) => a.date - b.date).reverse();
    }
}

export default PGPageContentVisBookmarks;
