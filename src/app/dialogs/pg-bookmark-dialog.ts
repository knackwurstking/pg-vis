import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";
import { UIDialog } from "ui";
import { Bookmarks, PGStore, Product } from "../../store-types";
import PGApp from "../pg-app";

@customElement("pg-bookmark-dialog")
class PGBookmarkDialog extends LitElement {
    @property({ type: Object, attribute: "product", reflect: false })
    product?: Product;

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    protected render() {
        const store = PGApp.queryStore();

        const newList = () => {
            // TODO: Create a new bookmarks list (dialog)
        };

        return html`
            <ui-dialog modal inert>
                <ui-flex-grid gap="0.25rem">
                    <ui-flex-grid-row justify="flex-end">
                        <ui-flex-grid-item flex="0">
                            <ui-button variant="full" color="secondary" @click=${newList}>
                                Neue Liste
                            </ui-button>
                        </ui-flex-grid-item>
                    </ui-flex-grid-row>

                    ${this.renderChecklists(store)}
                </ui-flex-grid>
            </ui-dialog>
        `;
    }

    private renderChecklists(store: PGStore) {
        if (this.product === undefined) return html``;

        const bookmarksData = store.getData("visBookmarks") || [];

        const toggleBookmark = (list: Bookmarks) => {
            // TODO: Add/Remove to/from bookmarks store
        };

        const content = [];
        for (const list of bookmarksData) {
            content.push(
                keyed(
                    list,
                    html`
                        <ui-label primary="${list.title}" ripple>
                            <ui-check
                                ?checked=${this.isBookmark(list)}
                                @click=${() => toggleBookmark(list)}
                            ></ui-check>
                        </ui-label>
                    `,
                ),
            );
        }

        return `<ui-flex-grid-item>${content}</ui-flex-grid-item>`;
    }

    public isBookmark(bookmarks: Bookmarks): boolean {
        if (this.product === undefined) return false;

        const productKey = `${this.product.lotto} ${this.product.name}`;
        return (
            bookmarks.data.find((product) => `${product.lotto} ${product.name}` === productKey) ===
            undefined
        );
    }

    public show() {
        this.querySelector<UIDialog>("ui-dialog")!.show();
    }

    public close() {
        this.querySelector<UIDialog>("ui-dialog")!.close();
    }
}

export default PGBookmarkDialog;
