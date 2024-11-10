import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";
import { CleanUp, UIDialog } from "ui";
import { Bookmarks, PGStore, Product } from "../../store-types";
import PGApp from "../pg-app";

@customElement("pg-bookmark-dialog")
class PGBookmarkDialog extends LitElement {
    @property({ type: Object, attribute: "product", reflect: false })
    product?: Product;

    private cleanup = new CleanUp();

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    protected render() {
        const store = PGApp.queryStore();

        const newList = () => {
            const dialog = PGApp.queryVisBookmarksDialog()!;
            dialog.title = "";
            dialog.invalidTitle = false;
            dialog.show();
        };

        return html`
            <ui-dialog title="Bookmark" modal inert>
                <ui-flex-grid gap="0.25rem">
                    <ui-flex-grid-row justify="flex-end">
                        <ui-flex-grid-item flex="1">
                            <ui-button
                                style="text-wrap: nowrap;"
                                variant="full"
                                color="secondary"
                                ripple
                                @click=${newList}
                            >
                                Neue Liste
                            </ui-button>
                        </ui-flex-grid-item>
                    </ui-flex-grid-row>

                    <ui-flex-grid-item>${this.renderChecklists(store)}</ui-flex-grid-item>
                </ui-flex-grid>

                <ui-button
                    slot="actions"
                    variant="full"
                    color="primary"
                    @click=${async () => this.close()}
                >
                    OK
                </ui-button>
            </ui-dialog>
        `;
    }

    private renderChecklists(store: PGStore) {
        if (this.product === undefined) return html``;

        const bookmarksData = store.getData("visBookmarks") || [];

        const toggleBookmark = (list: Bookmarks) => {
            if (this.isBookmark(list)) {
                // TODO:: Remove from list
            } else {
                // TODO: Add to list
            }

            // TODO: Update "visBookmarks" store
        };

        const content = [];
        for (const list of bookmarksData) {
            content.push(
                keyed(
                    list,
                    html`
                        <ui-flex-grid-item>
                            <ui-label primary="${list.title}" ripple>
                                <ui-check
                                    ?checked=${this.isBookmark(list)}
                                    @click=${() => toggleBookmark(list)}
                                ></ui-check>
                            </ui-label>
                        </ui-flex-grid-item>
                    `,
                ),
            );
        }

        return html`<ui-flex-grid gap="0.25rem">${content}</ui-flex-grid>`;
    }

    connectedCallback(): void {
        super.connectedCallback();
        const store = PGApp.queryStore();
        this.cleanup.add(store.addListener("visBookmarks", () => this.requestUpdate()));
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.cleanup.run();
    }

    public isBookmark(bookmarks: Bookmarks): boolean {
        if (this.product === undefined) return false;

        const productKey = `${this.product.lotto} ${this.product.name}`;
        return (
            bookmarks.data.find((product) => `${product.lotto} ${product.name}` === productKey) !==
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
