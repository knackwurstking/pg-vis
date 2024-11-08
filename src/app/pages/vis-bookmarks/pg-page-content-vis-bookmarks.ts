import { customElement } from "lit/decorators.js";
import { PGPageContent } from "..";
import { Bookmarks } from "../../../store-types";
import { html } from "ui";
import { PGApp } from "../..";
import { newListsStore } from "../../../lib/lists-store";

@customElement("pg-page-content-vis-bookmarks")
class PGPageContentVisBookmarks extends PGPageContent<Bookmarks> {
    protected render() {
        PGApp.queryAppBar()!.contentName("title")!.contentAt(0).innerText =
            this.data !== undefined
                ? newListsStore("visBookmarks").listKey(this.data)
                : newListsStore("visBookmarks").title();

        return html``; // TODO: Continue here...
    }
}

export default PGPageContentVisBookmarks;
