import { css, html, LitElement, PropertyValues } from "lit";
import { customElement } from "lit/decorators.js";
import { svg, UIAppBar, UIDrawer } from "ui";
import { build, version } from "../constants";
import { PGStore } from "../types";
import PGDrawerItem from "./pg-drawer-item";

@customElement("pg-app")
class PGApp extends LitElement {
    static queryStore(): PGStore {
        return document.querySelector<PGStore>("ui-store")!;
    }

    static queryAppBar(): UIAppBar | null {
        return document.querySelector<UIAppBar>("ui-app-bar") || null;
    }

    static queryDrawer(): UIDrawer | null {
        return document.querySelector<UIDrawer>("ui-drawer") || null;
    }

    static get styles() {
        return css`
            :host {
                position: fixed !important;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
            }

            ui-drawer ui-button.version {
                display: flex;
                justify-content: flex-start;

                margin-bottom: var(--ui-spacing);
                padding: 0.25rem;

                font-size: 0.85rem;
                text-transform: none;
            }
        `;
    }

    protected render() {
        return html`
            <div class="is-container no-scrollbar" style="height: 100%;">
                <ui-stack-layout></ui-stack-layout>
            </div>

            ${this.renderAppBar()} ${this.renderDrawer()}
        `;
    }

    private renderAppBar() {
        return html`
            <ui-app-bar position="top">
                <ui-app-bar-item name="menu" slot="left">
                    <ui-icon-button
                        ghost
                        ripple
                        @click=${() => {
                            const drawer = PGApp.queryDrawer()!;
                            drawer.open = true;
                        }}
                    >
                        ${svg.smoothieLineIcons.menu}
                    </ui-icon-button>
                </ui-app-bar-item>

                <ui-app-bar-item name="back" slot="left" hidden>
                    <ui-icon-button ghost ripple>
                        ${svg.smoothieLineIcons.chevronLeft}
                    </ui-icon-button>
                </ui-app-bar-item>

                <ui-app-bar-item name="title" slot="center">
                    <ui-heading style="white-space: nowrap;">
                        PG: Vis
                    </ui-heading>
                </ui-app-bar-item>

                <ui-app-bar-item name="edit" slot="right" hidden>
                    <ui-icon-button ripple ghost>
                        ${svg.smoothieLineIcons.pen}
                    </ui-icon-button>
                </ui-app-bar-item>

                <ui-app-bar-item name="share" slot="right" hidden>
                    <ui-icon-button ripple ghost>
                        ${svg.smoothieLineIcons.share}
                    </ui-icon-button>
                </ui-app-bar-item>

                <ui-app-bar-item name="search" slot="right" hidden>
                    <ui-icon-button ripple ghost>
                        ${svg.smoothieLineIcons.search}
                    </ui-icon-button>
                </ui-app-bar-item>

                <ui-app-bar-item name="bookmark" slot="right" hidden>
                    <ui-icon-button ripple ghost>
                        ${svg.smoothieLineIcons.bookmark}
                    </ui-icon-button>
                </ui-app-bar-item>
            </ui-app-bar>
        `;
    }

    private renderDrawer() {
        return html`
            <ui-drawer>
                <ui-drawer-group name="app-info" no-fold>
                    <ui-button
                        class="version"
                        variant="ghost"
                        color="primary"
                        ripple
                        @click=${() => {
                            // TODO: Open build info dialog
                            // NOTE: Old version
                            // const versionElement = this.querySelector("ui-button.version");
                            // versionElement.ui.events.on("click", () => {
                            //     utils.create.buildInfoDialog();
                            // });
                        }}
                    >
                        ${version} - [Build: ${build}]
                    </ui-button>
                </ui-drawer-group>

                <ui-drawer-group
                    name="alert-lists"
                    title="Alarm Listen"
                    data-fixed-items="2"
                >
                    <!-- Fixed Item 1 -->
                    <!-- TODO: Import / Export -->
                    <span class="placeholder"></span>

                    <!-- Fixed Item 2 -->
                    <!-- TODO: Gist -->
                    <span class="placeholder"></span>
                </ui-drawer-group>

                <ui-drawer-group
                    name="metal-sheets"
                    title="Blech Listen"
                    data-fixed-items="3"
                >
                    <!-- Fixed Item 1 -->
                    <!-- TODO: Import / Export -->
                    <span class="placeholder"></span>

                    <!-- Fixed Item 2 -->
                    <!-- TODO: Gist -->
                    <span class="placeholder"></span>

                    <!-- Fixed Item 3 -->
                    <!-- TODO: Create new table -->
                    <span class="placeholder"></span>
                </ui-drawer-group>

                <ui-drawer-group name="vis" title="Vis" data-fixed-items="2">
                    <!-- Fixed Item 1 -->
                    <!-- TODO: Import / Export -->
                    <span class="placeholder"></span>

                    <!-- Fixed Item 2 -->
                    <!-- TODO: Gist -->
                    <span class="placeholder"></span>
                </ui-drawer-group>

                <ui-drawer-group
                    name="vis-bookmarks"
                    title="Vis Bookmarks"
                    data-fixed-items="0"
                ></ui-drawer-group>

                <ui-drawer-group
                    name="vis-data"
                    title="Vis Data"
                    data-fixed-items="3"
                >
                    <!-- Fixed Item 1 -->
                    <!-- TODO: Import / Export -->
                    <span class="placeholder"></span>

                    <!-- Fixed Item 2 -->
                    <!-- TODO: Gist -->
                    <span class="placeholder"></span>

                    <!-- Fixed Item 3 -->
                    <!-- TODO: Create new -->
                    <span class="placeholder"></span>
                </ui-drawer-group>
            </ui-drawer>
        `;
    }

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    protected firstUpdated(_changedProperties: PropertyValues): void {
        this._initStores();

        this._storeHandlers();
    }

    private _initStores() {
        const store = PGApp.queryStore();
        store.setData(
            "alertLists",
            [
                {
                    title: "Test List 1",
                    data: [],
                },
                {
                    title: "Test List 2",
                    data: [],
                },
            ],
            false,
        ); // NOTE: Dummy data for testing
    }

    private _storeHandlers() {
        const store = PGApp.queryStore();

        this._renderDrawerItemsForAlertLists(store);
    }

    private _renderDrawerItemsForAlertLists(store: PGStore): void {
        store.addListener(
            "alertLists",
            (data) => {
                const groupContainer = this.querySelector(
                    `ui-drawer-group[name="alert-lists"]`,
                )!;

                const fixedItems = parseInt(
                    groupContainer.getAttribute("data-fixed-items") || "0",
                );

                Array.from(groupContainer.children)
                    .slice(0, fixedItems)
                    .forEach((child) => groupContainer.removeChild(child));

                data.forEach((list) => {
                    console.debug(list);
                    setTimeout(async () => {
                        const groupItem = new PGDrawerItem();
                        groupItem.storeKey = "alertLists";
                        groupItem.storeKeyEntry = list.title;
                        groupItem.primary = list.title;
                        groupItem.secondary = `${list.data.length} Entries`;
                        groupItem.allowDeletion = true;
                        groupContainer.appendChild(groupItem);
                    });
                });
            },
            true,
        );
    }
}

export default PGApp;

//export class _PGApp extends HTMLElement {
//    constructor() {
//        super();
//
//        this.cleanup = new CleanUp();
//
//        /** @type {PGStore} */
//        this.uiStore = null;
//
//        /** @type {import("ui").UIStackLayout} */
//        this.stackLayout = null;
//
//        /** @type {import("./components/pg-app-bar").PGAppBar} */
//        this.pgAppBar = null;
//
//        /** @type {import("./components/pg-drawer").PGDrawer} */
//        this.pgDrawer = null;
//
//        this.render();
//    }
//
//    render() {
//        this.uiStore = this.querySelector("ui-store");
//        this.stackLayout = this.querySelector("ui-stack-layout");
//        this.pgAppBar = this.querySelector("pg-app-bar");
//        this.pgDrawer = this.querySelector("pg-drawer");
//
//        this.createStore();
//        this.createStackLayout();
//    }
//
//    connectedCallback() {
//        this.pgDrawer.ui.open = true;
//
//        this.cleanup.add(
//            this.uiStore.ui.on(
//                "appBarTitle",
//                this.onAppBarTitle.bind(this),
//                true,
//            ),
//
//            this.uiStore.ui.on("share", this.onShare.bind(this), true),
//        );
//
//        this.setupNoPage();
//
//        this.handleVersion();
//    }
//
//    disconnectedCallback() {
//        this.cleanup.run();
//    }
//
//    handleVersion() {
//        const localVersion = localStorage.getItem("pg-vis:version");
//        if (localVersion !== version) {
//            localStorage.setItem("pg-vis:version", version);
//            console.log(
//                `Updated from "${localVersion}" to version "${version}"`,
//            );
//        }
//
//        const localBuild = parseInt(
//            localStorage.getItem("pg-vis:build") || "0",
//        );
//        if (localBuild !== build) {
//            localStorage.setItem("pg-vis:build", build.toString());
//        }
//    }
//
//    /** @private */
//    createStore() {
//        this.uiStore.ui.set("alertLists", [], true);
//        this.uiStore.ui.set("metalSheetLists", [], true);
//        this.uiStore.ui.set("vis", [], true);
//
//        this.uiStore.ui.set(
//            "visLists",
//            [
//                {
//                    name: "Presse 0",
//                    allowDeletion: false,
//                    data: [],
//                },
//                {
//                    name: "Presse 2",
//                    allowDeletion: false,
//                    data: [],
//                },
//                {
//                    name: "Presse 3",
//                    allowDeletion: false,
//                    data: [],
//                },
//                {
//                    name: "Presse 4",
//                    allowDeletion: false,
//                    data: [],
//                },
//                {
//                    name: "Presse 5",
//                    allowDeletion: false,
//                    data: [],
//                },
//            ],
//            true,
//        );
//
//        this.uiStore.ui.set("visData", [], true);
//
//        this.uiStore.ui.set("gist", {}, true);
//
//        this.uiStore.ui.set("appBarTitle", "", false);
//        this.uiStore.ui.set("edit", null, false);
//        this.uiStore.ui.set("share", null, false);
//        this.uiStore.ui.set("search", { active: false }, false);
//        this.uiStore.ui.set("bookmark", { active: false }, false);
//    }
//
//    /** @private */
//    createStackLayout() {
//        this.stackLayout.ui.events.on("change", ({ newPage }) => {
//            // Handle back button
//            if (this.stackLayout.ui.size() > 1) {
//                // Enable back button
//                this.pgAppBar.items.back.ui.show();
//            } else {
//                // Disable back button
//                this.pgAppBar.items.back.ui.hide();
//            }
//
//            if (!newPage) {
//                this.setupNoPage();
//                return;
//            }
//
//            switch (newPage.ui.name) {
//                case pages.alertLists:
//                case pages.alert:
//                case pages.metalSheetLists:
//                case pages.vis:
//                case pages.product:
//                case pages.visLists:
//                case pages.visData:
//                case pages.visDataEntry:
//                    this.resetAppBar();
//            }
//
//            switch (newPage.ui.name) {
//                case pages.alertLists:
//                    this.pgAppBar.items.search.ui.show();
//                    break;
//
//                case pages.metalSheetLists:
//                    this.pgAppBar.items.edit.ui.show();
//                    break;
//
//                case pages.product:
//                    this.pgAppBar.items.bookmark.ui.show();
//                    break;
//
//                case pages.visData:
//                    this.pgAppBar.items.edit.ui.show();
//                    break;
//            }
//        });
//
//        this.stackLayout.ui.register(
//            pages.alertLists,
//            () => new AlertListsPage(),
//        );
//        this.stackLayout.ui.register(pages.alert, () => new AlertPage());
//
//        this.stackLayout.ui.register(
//            pages.metalSheetLists,
//            () => new MetalSheetListsPage(),
//        );
//
//        this.stackLayout.ui.register(pages.vis, () => new VisPage());
//        this.stackLayout.ui.register(pages.visLists, () => new VisListsPage());
//        this.stackLayout.ui.register(pages.visData, () => new VisDataPage());
//
//        this.stackLayout.ui.register(pages.product, () => new ProductPage());
//        this.stackLayout.ui.register(
//            pages.visDataEntry,
//            () => new VisDataEntryPage(),
//        );
//    }
//
//    /** @private */
//    setupNoPage() {
//        this.resetAppBar();
//        this.uiStore.ui.set("appBarTitle", "PG: Vis");
//        this.pgDrawer.ui.open = true;
//    }
//
//    /** @private */
//    resetAppBar() {
//        this.pgAppBar.items.edit.ui.hide();
//        this.pgAppBar.items.share.ui.hide();
//        this.pgAppBar.items.search.ui.hide();
//        this.pgAppBar.items.bookmark.ui.hide();
//    }
//
//    /**
//     * @private
//     * @param {string} title
//     */
//    async onAppBarTitle(title) {
//        this.pgAppBar.items.title.ui.child.innerHTML = title || "";
//    }
//
//    /**
//     * @private
//     * @param {ShareData} data
//     */
//    async onShare(data) {
//        if (data !== null) {
//            this.pgAppBar.items.share.ui.show();
//        } else {
//            this.pgAppBar.items.share.ui.hide();
//        }
//    }
//}
