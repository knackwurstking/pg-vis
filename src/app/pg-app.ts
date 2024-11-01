import "./dialogs/pg-import-dialog"; // Register "pg-import-dialog"
import "./pg-drawer-item-gist"; // Register "pg-drawer-item-gist"
import "./pg-drawer-item-import"; // Register "pg-drawer-item-import"

import { html, LitElement, PropertyValues } from "lit";
import { customElement } from "lit/decorators.js";
import {
    styles,
    svg,
    UIAppBar,
    UIDrawer,
    UIStackLayout,
    UIStackLayoutPage,
} from "ui";
import { build, version } from "../constants";
import { newListsStore } from "../lib/lists-store";
import { PGStackLayoutPage, PGStore } from "../store-types";
import PGImportDialog from "./dialogs/pg-import-dialog";
import {
    PGPageContentAlert,
    PGPageContentAlertLists,
    PGPageContentMetalSheets,
} from "./pages";
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

    static queryStackLayout(): UIStackLayout<PGStackLayoutPage> | null {
        return document.querySelector<UIStackLayout<PGStackLayoutPage>>(
            "ui-stack-layout",
        );
    }

    static queryImportDialog(): PGImportDialog | null {
        return document.querySelector<PGImportDialog>(`pg-import-dialog`);
    }

    constructor() {
        super();
        this.initializeStores();
    }

    private initializeStores() {
        const store = PGApp.queryStore();

        store.setData("drawerGroup", {}, true);

        store.setData("alertLists", [], true);
        store.setData("metalSheets", [], true);

        store.setData("gist", {}, true);
    }

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    protected render() {
        return html`
            <div class="is-container no-scrollbar" style="height: 100%;">
                <ui-stack-layout></ui-stack-layout>
            </div>

            ${this.renderAppBar()} ${this.renderDrawer()}
            ${this.renderDialogs()}
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
                    <ui-icon-button
                        ghost
                        ripple
                        @click=${() => {
                            const stack = PGApp.queryStackLayout()!;
                            stack.goBack();
                        }}
                    >
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
        const store = PGApp.queryStore();

        return html`
            <ui-drawer
                ?open=${!!store.getData("drawer")?.open}
                @open=${() => {
                    store.setData("drawer", { open: true });
                }}
                @close=${() => {
                    store.setData("drawer", { open: false });
                }}
            >
                <ui-drawer-group name="app-info" no-fold>
                    <ui-button
                        style="${styles({
                            display: "flex",
                            justifyContent: "flex-start",
                            marginBottom: "var(--ui-spacing)",
                            padding: "0.25rem",
                            fontSize: "0.85rem",
                            textTransform: "none",
                        } as CSSStyleDeclaration)}"
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
                    gap="0.25rem"
                    ?open=${!!store.getData("drawerGroup")?.["alert-lists"]
                        ?.open}
                    @fold=${() => {
                        store.updateData(`drawerGroup`, (data) => {
                            data["alert-lists"] = { open: false };
                            return data;
                        });
                    }}
                    @unfold=${() => {
                        store.updateData(`drawerGroup`, (data) => {
                            data["alert-lists"] = { open: true };
                            return data;
                        });
                    }}
                >
                    <!-- Fixed Item 1 -->
                    <pg-drawer-item-import
                        store-key="alertLists"
                    ></pg-drawer-item-import>

                    <!-- Fixed Item 2 -->
                    <pg-drawer-item-gist
                        store-key="alertLists"
                    ></pg-drawer-item-gist>
                </ui-drawer-group>

                <ui-drawer-group
                    name="metal-sheets"
                    title="Blech Listen"
                    data-fixed-items="3"
                    gap="0.25rem"
                >
                    <!-- Fixed Item 1 -->
                    <pg-drawer-item-import
                        store-key="metalSheets"
                    ></pg-drawer-item-import>

                    <!-- Fixed Item 2 -->
                    <pg-drawer-item-gist
                        store-key="metalSheets"
                    ></pg-drawer-item-gist>

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

    private renderDialogs() {
        return html` <pg-import-dialog></pg-import-dialog> `;
    }

    protected updated(_changedProperties: PropertyValues): void {
        this.updatedRegisterPages();
        this.updatedLayout();
    }

    private updatedRegisterPages() {
        const stack = PGApp.queryStackLayout()!;

        // Main pages

        stack.registerPage("alertLists", () => {
            const page = new UIStackLayoutPage();
            page.name = "alertLists";

            const content = new PGPageContentAlertLists();
            page.appendChild(content);
            return page;
        });

        stack.registerPage("metalSheets", () => {
            const page = new UIStackLayoutPage();
            page.name = "metalSheets";

            const content = new PGPageContentMetalSheets();
            page.appendChild(content);
            return page;
        });

        // Sub pages

        stack.registerPage("alert", () => {
            const page = new UIStackLayoutPage();
            page.name = "alert";

            const content = new PGPageContentAlert();
            page.appendChild(content);
            return page;
        });
    }

    private updatedLayout() {
        const stack = PGApp.queryStackLayout()!;
        const appBar = PGApp.queryAppBar()!;
        const drawer = PGApp.queryDrawer()!;

        stack.events.addListener("change", ({ current }) => {
            if (stack.stackSize() > 1) {
                appBar.contentName("back")!.show();
            } else {
                appBar.contentName("back")!.hide();
            }

            appBar.content("left").forEach((child) => {
                if (child.name === "menu" || child.name === "back") return;
                child.hide();
            });

            appBar.content("right").forEach((child) => {
                child.hide();
            });

            if (current === null) {
                appBar.contentName("title")!.contentAt(0)!.innerText =
                    "PG: Vis";

                drawer.open = true;
                return;
            }

            switch (current.name as PGStackLayoutPage) {
                case "alertLists":
                    appBar.contentName("search")!.show();
                    break;

                case "metalSheets":
                    appBar.contentName("edit")!.show();
                    break;

                case "visData":
                    appBar.contentName("edit")!.show();
                    break;

                //case "product":
                //    appBar.contentName("bookmark")!.show();
                //    break;
            }
        });
    }

    protected firstUpdated(_changedProperties: PropertyValues): void {
        this.style.position = "fixed";
        this.style.top = "0";
        this.style.right = "0";
        this.style.bottom = "0";
        this.style.left = "0";

        const store = PGApp.queryStore();

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
                    .slice(fixedItems)
                    .forEach((child) => groupContainer.removeChild(child));

                const listsStore = newListsStore("alertLists");
                data.forEach(async (list) => {
                    const groupItem = new PGDrawerItem();
                    groupItem.storeKey = listsStore.key();
                    groupItem.primary = groupItem.storeListKey =
                        listsStore.listKey(list);
                    groupItem.secondary = `${list.data.length} Einträge`;
                    groupItem.allowDeletion = true;
                    groupContainer.appendChild(groupItem);
                });
            },
            true,
        );

        store.addListener(
            "metalSheets",
            (data) => {
                const groupContainer = this.querySelector(
                    `ui-drawer-group[name="metal-sheets"]`,
                )!;

                const fixedItems = parseInt(
                    groupContainer.getAttribute("data-fixed-items") || "0",
                );

                Array.from(groupContainer.children)
                    .slice(fixedItems)
                    .forEach((child) => groupContainer.removeChild(child));

                const listsStore = newListsStore("metalSheets");
                data.forEach(async (list) => {
                    const groupItem = new PGDrawerItem();
                    groupItem.storeKey = listsStore.key();
                    groupItem.primary = groupItem.storeListKey =
                        listsStore.listKey(list);
                    groupItem.secondary = `${list.data.table.data.length} Einträge`;
                    groupItem.allowDeletion = true;
                    groupContainer.appendChild(groupItem);
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
