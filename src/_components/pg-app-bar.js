import { UIAppBar, html } from "ui";

export class PGAppBar extends UIAppBar {
    constructor() {
        super();

        /** @type {PGStore} */
        this.uiStore = document.querySelector("ui-store");

        /** @type {import("ui").UIDrawer} */
        this.uiDrawer = document.querySelector("pg-drawer");

        /** @type {import("ui").UIStackLayout} */
        this.stackLayout = document.querySelector("ui-stack-layout");

        this.render();
    }

    connectedCallback() {
        super.connectedCallback();

        this.uiStore.ui.events.on("bookmark", (data) => {
            if (data.active) {
                this.items.bookmark.ui.child.style.color = "orange";
            } else {
                this.items.bookmark.ui.child.style.color = null;
            }
        });
    }

    /** @private */
    createMenuItem() {
        /** @type {import("ui").UIAppBarItem<import("ui").UIIconButton>} */
        const menu = this.querySelector(`[name="menu"]`);

        const child = menu.ui.child;
        child.ui.events.on("click", async () => {
            this.uiDrawer.ui.open = true;
        });

        return menu;
    }

    /** @private */
    createBackItem() {
        /** @type {import("ui").UIAppBarItem<import("ui").UIIconButton>} */
        const back = this.querySelector(`[name="back"]`);

        const child = back.ui.child;
        child.ui.events.on("click", async () => this.stackLayout.ui.goBack());

        return back;
    }

    /** @private */
    createTitleItem() {
        /** @type {import("ui").UIAppBarItem<HTMLElement>} */
        const title = this.querySelector(`[name="title"]`);
        return title;
    }

    /** @private */
    createEditItem() {
        /** @type {import("ui").UIAppBarItem<import("ui").UIIconButton>} */
        const edit = this.querySelector(`[name="edit"]`);

        const child = edit.ui.child;
        child.ui.events.on("click", () => {
            const cb = this.uiStore.ui.get("edit").onClick;
            if (typeof cb === "function") cb();
        });

        return edit;
    }

    /** @private */
    createShareItem() {
        /** @type {import("ui").UIAppBarItem<import("ui").UIIconButton>} */
        const share = this.querySelector(`[name="share"]`);

        const child = share.ui.child;
        child.ui.events.on("click", async () => {
            /** @type {ShareData} */
            const data = this.uiStore.ui.get("share")?.() || null;
            if (!data) return;

            const download = async () => {
                const a = document.createElement("a");

                for (const file of data.files) {
                    a.download = file.name;
                    a.href =
                        `data:application/json;charset=utf-8,` +
                        encodeURIComponent(await file.text());
                    a.click();
                }
            };

            if (!navigator.canShare) {
                return await download();
            }

            if (navigator.canShare(data)) {
                try {
                    await navigator.share(data);
                } catch {
                    await download();
                }

                return;
            }

            await download();
        });

        return share;
    }

    /** @private */
    createSearchItem() {
        /** @type {import("ui").UIAppBarItem<import("ui").UIIconButton>} */
        const search = this.querySelector(`[name="search"]`);

        const child = search.ui.child;
        child.ui.events.on("click", () =>
            this.uiStore.ui.update("search", (data) => ({
                ...data,
                active: !data.active,
            })),
        );

        return search;
    }

    /** @private */
    createBookmark() {
        /** @type {import("ui").UIAppBarItem<import("ui").UIIconButton>} */
        const bookmark = this.querySelector(`[name="bookmark"]`);
        return bookmark;
    }
}
