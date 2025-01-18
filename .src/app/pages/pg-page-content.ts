import { customElement, property } from "lit/decorators.js";

import { LitElement } from "lit";

import * as app from "@app";
import * as lib from "@lib";

@customElement("pg-page-content")
class PGPageContent<T> extends LitElement {
    name = "";

    @property({ type: Object, attribute: "data", reflect: false })
    data?: T;

    slot = "";

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        this.style.width = "100%";
        this.style.height = "100%";
        this.style.display = "block";
        this.style.paddingTop = "var(--ui-app-bar-height)";
        return this;
    }

    protected renderListsAppBarTitle<T extends keyof lib.listStores.ListStoreData>(
        storeKey: T,
        data: lib.listStores.ListStoreData[T] | undefined,
    ) {
        app.PGApp.queryAppBar()!.contentName("title")!.contentAt(0).innerText =
            data !== undefined
                ? lib.listStore(storeKey).listKey(data)
                : lib.listStore(storeKey).title();
    }
}

export default PGPageContent;
