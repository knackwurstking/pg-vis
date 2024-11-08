import { customElement } from "lit/decorators.js";
import { html } from "ui";
import { PGPageContent } from "..";
import { PGApp } from "../..";
import { newListsStore } from "../../../lib/lists-store";
import { Bookmarks } from "../../../store-types";

@customElement("pg-page-content-vis-bookmarks")
class PGPageContentVisBookmarks extends PGPageContent<Bookmarks> {
    protected render() {
        PGApp.queryAppBar()!.contentName("title")!.contentAt(0).innerText =
            this.data !== undefined
                ? newListsStore("visBookmarks").listKey(this.data)
                : newListsStore("visBookmarks").title();

        return html`
            <div
                class="container no-scrollbar"
                style="width: 100%; height: 100%; overflow: auto;"
            >
                ${this.renderData()}
            </div>
        `;
    }

    private renderData() {
        return html``; // TODO: Iter data, but check "vis" store first
    }
}

export default PGPageContentVisBookmarks;
