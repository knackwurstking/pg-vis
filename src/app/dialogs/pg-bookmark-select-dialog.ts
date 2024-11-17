import { customElement, property } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";

import { html, LitElement } from "lit";
import { CleanUp, UIDialog } from "ui";

import * as app from "@app";
import * as lib from "@lib";
import * as types from "@types";

@customElement("pg-bookmark-select-dialog")
class PGBookmarkSelectDialog extends LitElement {
    @property({ type: Object, attribute: "product", reflect: false })
    product?: types.Product;

    private cleanup = new CleanUp();

    public isBookmark(bookmarks: types.Bookmarks): boolean {
        if (this.product === undefined) return false;

        const productKey = lib.productKey(this.product);
        return (
            bookmarks.data.find((product) => lib.productKey(product) === productKey) !== undefined
        );
    }

    public show() {
        this.querySelector<UIDialog>("ui-dialog")!.show();
    }

    public close() {
        this.querySelector<UIDialog>("ui-dialog")!.close();
    }

    connectedCallback(): void {
        super.connectedCallback();
        const store = app.PGApp.queryStore();
        this.cleanup.add(store.addListener("visBookmarks", () => this.requestUpdate()));
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.cleanup.run();
    }

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    protected render() {
        const store = app.PGApp.queryStore();

        const newList = () => {
            const dialog = app.PGApp.queryVisBookmarksDialog()!;
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

    private renderChecklists(store: types.PGStore) {
        if (this.product === undefined) return html``;

        const bookmarksData = store.getData("visBookmarks") || [];

        const toggleBookmark = (list: types.Bookmarks) => {
            if (this.product === undefined) return;

            const productKey = lib.productKey(this.product);
            lib.listStore("visBookmarks").replaceInStore(
                app.PGApp.queryStore(),
                {
                    ...list,
                    data: this.isBookmark(list)
                        ? list.data.filter((bookmarkProduct) => {
                              return lib.productKey(bookmarkProduct) !== productKey;
                          })
                        : [...list.data, this.product],
                },
                list,
            );
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
}

export default PGBookmarkSelectDialog;
