import { customElement } from "lit/decorators.js";

import { html, LitElement, PropertyValues } from "lit";
import {
    styles,
    svg,
    UIDrawer,
    UIDrawerGroupItem,
    UIStackLayout,
    UIStackLayoutPage,
    UIThemeHandler,
    UIThemeHandlerTheme,
} from "ui";

import * as app from "@app";
import * as constants from "@constants";
import * as lib from "@lib";
import * as types from "@types";

@customElement("pg-app")
class PGApp extends LitElement {
    static queryStore(): types.PGStore {
        return document.querySelector<types.PGStore>("ui-store")!;
    }

    static queryThemeHandler(): UIThemeHandler {
        return document.querySelector<UIThemeHandler>("ui-theme-handler")!;
    }

    static queryAppBar(): types.PGAppBar | null {
        return document.querySelector<types.PGAppBar>("ui-app-bar") || null;
    }

    static queryDrawer(): UIDrawer | null {
        return document.querySelector<UIDrawer>("ui-drawer") || null;
    }

    static queryStackLayout(): UIStackLayout<types.PGStackLayoutPage> | null {
        return document.querySelector<UIStackLayout<types.PGStackLayoutPage>>("ui-stack-layout");
    }

    static queryImportDialog(): app.PGImportDialog | null {
        return document.querySelector<app.PGImportDialog>(`pg-import-dialog`);
    }

    static queryVisBookmarksDialog(): app.PGVisBookmarksDialog | null {
        return document.querySelector<app.PGVisBookmarksDialog>(`pg-vis-bookmarks-dialog`);
    }

    static queryBookmarkSelectDialog(): app.PGBookmarkSelectDialog | null {
        return document.querySelector<app.PGBookmarkSelectDialog>(`pg-bookmark-select-dialog`);
    }

    static queryVisDataDialog(): app.PGVisDataDialog | null {
        return document.querySelector<app.PGVisDataDialog>(`pg-vis-data-dialog.newList`);
    }

    constructor() {
        super();
        this.initializeStores();
    }

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    protected render() {
        return html`
            <div class="is-container no-scrollbar" style="height: 100%;">
                <ui-stack-layout></ui-stack-layout>
            </div>

            ${this.renderAppBar()} ${this.renderDrawer()} ${this.renderDialogs()}
        `;
    }

    protected firstUpdated(_changedProperties: PropertyValues): void {
        this.style.position = "fixed";
        this.style.top = "0";
        this.style.right = "0";
        this.style.bottom = "0";
        this.style.left = "0";

        this.registerPages();
        this.handleStackLayoutChanges();
        this.storeEventHandlers();
    }

    private initializeStores() {
        const store = PGApp.queryStore();

        store.setData("theme", { name: "original" }, true);

        // NOTE: Always open the drawer on app start for now
        store.setData("drawer", { open: true }, false);

        store.setData("drawerGroup", {}, true);

        store.setData("alertLists", [], true);
        store.setData("metalSheets", [], true);
        store.setData("vis", [], true);

        store.setData(
            "visBookmarks",
            [
                {
                    title: "Presse 0",
                    allowDeletion: true,
                    data: [],
                },
                {
                    title: "Presse 2",
                    allowDeletion: true,
                    data: [],
                },
                {
                    title: "Presse 3",
                    allowDeletion: true,
                    data: [],
                },
                {
                    title: "Presse 4",
                    allowDeletion: true,
                    data: [],
                },
                {
                    title: "Presse 5",
                    allowDeletion: true,
                    data: [],
                },
            ],
            true,
        );

        store.setData("visData", [], true);
        store.setData(
            "special",
            [
                {
                    type: "flakes",
                    title: "Flakes",
                    data: [],
                },
            ],
            true,
        );

        store.setData("gist", {}, true);
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
                    <ui-heading style="white-space: nowrap;"> PG: Vis </ui-heading>
                </ui-app-bar-item>

                <ui-app-bar-item name="edit" slot="right" hidden>
                    <ui-icon-button ripple ghost> ${svg.smoothieLineIcons.pen} </ui-icon-button>
                </ui-app-bar-item>

                <ui-app-bar-item name="share" slot="right" hidden>
                    <ui-icon-button ripple ghost> ${svg.smoothieLineIcons.share} </ui-icon-button>
                </ui-app-bar-item>

                <ui-app-bar-item name="search" slot="right" hidden>
                    <ui-icon-button ripple ghost> ${svg.smoothieLineIcons.search} </ui-icon-button>
                </ui-app-bar-item>

                <ui-app-bar-item name="trash" slot="right" hidden>
                    <ui-icon-button ripple ghost> ${svg.smoothieLineIcons.trash} </ui-icon-button>
                </ui-app-bar-item>

                <ui-app-bar-item name="printer" slot="right" hidden>
                    <ui-icon-button ripple ghost> ${svg.smoothieLineIcons.printer} </ui-icon-button>
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
                    <ui-drawer-group-item>
                        <ui-button
                            style="${styles({
                                display: "flex",
                                justifyContent: "flex-start",
                                marginBottom: "var(--ui-spacing)",
                                padding: "0.25rem",
                                fontSize: "0.85rem",
                                textTransform: "none",
                                cursor: "default",
                            } as CSSStyleDeclaration)}"
                            variant="ghost"
                            color="secondary"
                        >
                            ${constants.version} - [Build: ${constants.build}]
                        </ui-button>
                    </ui-drawer-group-item>

                    <ui-drawer-group-item>
                        <ui-label primary="Theme">
                            <select
                                style="text-align: center;"
                                @change=${(
                                    ev: Event & {
                                        currentTarget: HTMLSelectElement;
                                    },
                                ) => {
                                    const selected = ev.currentTarget.children[
                                        ev.currentTarget.selectedIndex
                                    ] as HTMLOptionElement;

                                    store.setData("theme", {
                                        name: selected.value as UIThemeHandlerTheme,
                                    });
                                }}
                            >
                                <option
                                    value="original"
                                    ?selected=${store.getData("theme")?.name === "original"}
                                >
                                    Original
                                </option>
                                <option
                                    value="gruvbox"
                                    ?selected=${store.getData("theme")?.name === "gruvbox"}
                                >
                                    Gruvbox
                                </option>
                            </select>
                        </ui-label>
                    </ui-drawer-group-item>
                </ui-drawer-group>

                <ui-drawer-group
                    name="alertLists"
                    title="Alarm Listen"
                    data-fixed-items="2"
                    gap="0.25rem"
                    ?open=${!!store.getData("drawerGroup")?.["alertLists"]?.open}
                    @fold=${() => {
                        store.updateData(`drawerGroup`, (data) => {
                            data["alertLists"] = { open: false };
                            return data;
                        });
                    }}
                    @unfold=${() => {
                        store.updateData(`drawerGroup`, (data) => {
                            data["alertLists"] = { open: true };
                            return data;
                        });
                    }}
                >
                    <!-- Fixed Item 1 -->
                    <ui-drawer-group-item>
                        <pg-drawer-item-import store-key="alertLists"></pg-drawer-item-import>
                    </ui-drawer-group-item>

                    <!-- Fixed Item 2 -->
                    <ui-drawer-group-item>
                        <pg-drawer-item-gist store-key="alertLists"></pg-drawer-item-gist>
                    </ui-drawer-group-item>
                </ui-drawer-group>

                <ui-drawer-group
                    name="metalSheets"
                    title="Blech Listen"
                    data-fixed-items="3"
                    gap="0.25rem"
                    ?open=${!!store.getData("drawerGroup")?.["metalSheets"]?.open}
                    @fold=${() => {
                        store.updateData(`drawerGroup`, (data) => {
                            data["metalSheets"] = { open: false };
                            return data;
                        });
                    }}
                    @unfold=${() => {
                        store.updateData(`drawerGroup`, (data) => {
                            data["metalSheets"] = { open: true };
                            return data;
                        });
                    }}
                >
                    <!-- Fixed Item 1 -->
                    <ui-drawer-group-item>
                        <pg-drawer-item-import store-key="metalSheets"></pg-drawer-item-import>
                    </ui-drawer-group-item>

                    <!-- Fixed Item 2 -->
                    <ui-drawer-group-item>
                        <pg-drawer-item-gist store-key="metalSheets"></pg-drawer-item-gist>
                    </ui-drawer-group-item>

                    <!-- Fixed Item 3 -->
                    <ui-drawer-group-item>
                        <ui-button
                            variant="full"
                            color="secondary"
                            @click=${() => {
                                const dialog = this.querySelector<app.PGMetalSheetTableDialog>(
                                    `pg-metal-sheet-table-dialog.newList`,
                                )!;

                                dialog.format = "";
                                dialog.toolID = "";
                                dialog.press = -1;

                                dialog.show();
                            }}
                        >
                            Neue Liste
                        </ui-button>
                    </ui-drawer-group-item>
                </ui-drawer-group>

                <ui-drawer-group
                    name="vis"
                    title="Vis"
                    data-fixed-items="2"
                    gap="0.25rem"
                    ?open=${!!store.getData("drawerGroup")?.["vis"]?.open}
                    @fold=${() => {
                        store.updateData(`drawerGroup`, (data) => {
                            data["vis"] = { open: false };
                            return data;
                        });
                    }}
                    @unfold=${() => {
                        store.updateData(`drawerGroup`, (data) => {
                            data["vis"] = { open: true };
                            return data;
                        });
                    }}
                >
                    <!-- Fixed Item 1 -->
                    <ui-drawer-group-item>
                        <pg-drawer-item-import store-key="vis"></pg-drawer-item-import>
                    </ui-drawer-group-item>

                    <!-- Fixed Item 2 -->
                    <ui-drawer-group-item>
                        <pg-drawer-item-gist store-key="vis"></pg-drawer-item-gist>
                    </ui-drawer-group-item>
                </ui-drawer-group>

                <ui-drawer-group
                    name="visBookmarks"
                    title="Vis Bookmarks"
                    data-fixed-items="1"
                    gap="0.25rem"
                    ?open=${!!store.getData("drawerGroup")?.["visBookmarks"]?.open}
                    @fold=${() => {
                        store.updateData(`drawerGroup`, (data) => {
                            data["visBookmarks"] = { open: false };
                            return data;
                        });
                    }}
                    @unfold=${() => {
                        store.updateData(`drawerGroup`, (data) => {
                            data["visBookmarks"] = { open: true };
                            return data;
                        });
                    }}
                >
                    <!-- Fixed Item 1 -->
                    <ui-drawer-group-item>
                        <ui-button
                            variant="full"
                            color="secondary"
                            @click=${() => {
                                const dialog = PGApp.queryVisBookmarksDialog()!;
                                dialog.title = "";
                                dialog.invalidTitle = false;
                                dialog.show();
                            }}
                        >
                            Neue Liste
                        </ui-button>
                    </ui-drawer-group-item>
                </ui-drawer-group>

                <ui-drawer-group
                    name="visData"
                    title="Vis Data"
                    data-fixed-items="3"
                    gap="0.25rem"
                    ?open=${!!store.getData("drawerGroup")?.["visData"]?.open}
                    @fold=${() => {
                        store.updateData(`drawerGroup`, (data) => {
                            data["visData"] = { open: false };
                            return data;
                        });
                    }}
                    @unfold=${() => {
                        store.updateData(`drawerGroup`, (data) => {
                            data["visData"] = { open: true };
                            return data;
                        });
                    }}
                >
                    <!-- Fixed Item 1 -->
                    <ui-drawer-group-item>
                        <pg-drawer-item-import store-key="visData"></pg-drawer-item-import>
                    </ui-drawer-group-item>

                    <!-- Fixed Item 2 -->
                    <ui-drawer-group-item>
                        <pg-drawer-item-gist store-key="visData"></pg-drawer-item-gist>
                    </ui-drawer-group-item>

                    <!-- Fixed Item 3 -->
                    <ui-drawer-group-item>
                        <ui-button
                            variant="full"
                            color="secondary"
                            @click=${() => {
                                const dialog = PGApp.queryVisDataDialog()!;
                                dialog.invalidTitle = false;
                                dialog.title = "";
                                dialog.show();
                            }}
                        >
                            Neue Liste
                        </ui-button>
                    </ui-drawer-group-item>
                </ui-drawer-group>

                <ui-drawer-group
                    name="special"
                    title="Spezial"
                    data-fixed-items="2"
                    gap="0.25rem"
                    ?open=${!!store.getData("drawerGroup")?.["special"]?.open}
                    @fold=${() => {
                        store.updateData(`drawerGroup`, (data) => {
                            data["special"] = { open: false };
                            return data;
                        });
                    }}
                    @unfold=${() => {
                        store.updateData(`drawerGroup`, (data) => {
                            data["special"] = { open: true };
                            return data;
                        });
                    }}
                >
                    <!-- Fixed Item 1 -->
                    <ui-drawer-group-item>
                        <pg-drawer-item-import store-key="special"></pg-drawer-item-import>
                    </ui-drawer-group-item>

                    <!-- Fixed Item 2 -->
                    <ui-drawer-group-item>
                        <pg-drawer-item-gist store-key="special"></pg-drawer-item-gist>
                    </ui-drawer-group-item>
                </ui-drawer-group>
            </ui-drawer>
        `;
    }

    private renderDialogs() {
        return html`
            <pg-import-dialog></pg-import-dialog>

            <pg-metal-sheet-table-dialog
                class="newList"
                title="Neue Liste"
                @submit=${(ev: Event & { currentTarget: app.PGMetalSheetTableDialog }) => {
                    const dialog = ev.currentTarget;

                    const format = ev.currentTarget.format;
                    const toolID = ev.currentTarget.toolID;
                    const press = ev.currentTarget.press;

                    const reopenDialog = () => {
                        dialog.format = format;
                        dialog.toolID = toolID;
                        dialog.press = press;

                        dialog.show();
                    };

                    if (!format || !toolID) {
                        setTimeout(reopenDialog);
                        return;
                    }

                    const store = PGApp.queryStore();
                    const newData = {
                        format: format,
                        toolID: toolID,
                        data: {
                            press: press,
                            table: {
                                header: [
                                    "Stärke",
                                    "Marke (Höhe)",
                                    "Blech Stempel",
                                    "Blech Marke",
                                    "Stf. P2 - P5",
                                    "Stf. P0",
                                ],
                                data: [],
                            },
                        },
                    };

                    const listsStore = lib.listStore("metalSheets");
                    const newListKey = listsStore.listKey(newData);

                    for (const list of store.getData("metalSheets") || []) {
                        if (listsStore.listKey(list) === newListKey) {
                            setTimeout(reopenDialog);
                            alert(`Liste "${newListKey}" existiert bereits!"`);
                            return;
                        }
                    }

                    listsStore.addToStore(store, [newData]);
                }}
            ></pg-metal-sheet-table-dialog>

            <pg-vis-data-dialog
                class="newList"
                @submit=${(ev: Event & { currentTarget: app.PGVisDataDialog }) => {
                    const title = ev.currentTarget.title;
                    const listsStore = lib.listStore("visData");

                    try {
                        listsStore.addToStore(PGApp.queryStore(), [
                            {
                                title: title,
                                data: [],
                            },
                        ]);
                    } catch (err) {
                        alert(err);
                        setTimeout(() => {
                            const dialog = PGApp.queryVisDataDialog()!;
                            dialog.invalidTitle = true;
                            dialog.show();
                        });
                    }
                }}
            >
            </pg-vis-data-dialog>

            <pg-vis-bookmarks-dialog
                @submit=${(ev: Event & { currentTarget: app.PGVisBookmarksDialog }) => {
                    const title = ev.currentTarget.title;
                    const listsStore = lib.listStore("visBookmarks");

                    try {
                        listsStore.addToStore(PGApp.queryStore(), [
                            {
                                title: title,
                                allowDeletion: true,
                                data: [],
                            },
                        ]);
                    } catch (err) {
                        alert(err);
                        setTimeout(() => {
                            const dialog = PGApp.queryVisBookmarksDialog()!;
                            dialog.invalidTitle = true;
                            dialog.show();
                        });
                    }
                }}
            >
            </pg-vis-bookmarks-dialog>

            <pg-bookmark-select-dialog></pg-bookmark-select-dialog>
        `;
    }

    private registerPages() {
        const stack = PGApp.queryStackLayout()!;

        // Main pages

        stack.registerPage("alertLists", () => {
            const page = new UIStackLayoutPage();
            page.name = "alertLists";
            page.appendChild(new app.PGPageContentAlertLists());
            return page;
        });

        stack.registerPage("metalSheets", () => {
            const page = new UIStackLayoutPage();
            page.name = "metalSheets";
            page.appendChild(new app.PGPageContentMetalSheets());
            return page;
        });

        stack.registerPage("vis", () => {
            const page = new UIStackLayoutPage();
            page.name = "vis";
            page.appendChild(new app.PGPageContentVis());
            return page;
        });

        stack.registerPage("visBookmarks", () => {
            const page = new UIStackLayoutPage();
            page.name = "visBookmarks";
            page.appendChild(new app.PGPageContentVisBookmarks());
            return page;
        });

        stack.registerPage("visData", () => {
            const page = new UIStackLayoutPage();
            page.name = "visData";
            page.appendChild(new app.PGPageContentVisData());
            return page;
        });

        stack.registerPage("special", () => {
            const page = new UIStackLayoutPage();
            page.name = "special";
            page.appendChild(new app.PGPageContentSpecial());
            return page;
        });

        // Sub pages

        stack.registerPage("alert", () => {
            const page = new UIStackLayoutPage();
            page.name = "alert";
            page.appendChild(new app.PGPageContentAlert());
            return page;
        });

        stack.registerPage("product", () => {
            const page = new UIStackLayoutPage();
            page.name = "product";
            page.append(new app.PGPageContentProduct());
            return page;
        });

        stack.registerPage("visDataEdit", () => {
            const page = new UIStackLayoutPage();
            page.name = "visDataEdit";
            page.append(new app.PGPageContentVisDataEdit());
            return page;
        });
    }

    private handleStackLayoutChanges() {
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
                appBar.contentName("title")!.contentAt(0)!.innerText = "PG: Vis";

                drawer.open = true;
                return;
            }

            switch (current.name as types.PGStackLayoutPage) {
                case "alertLists":
                    appBar.contentName("search")!.show();
                    break;

                case "metalSheets":
                    appBar.contentName("printer")!.show();
                    appBar.contentName("edit")!.show();
                    break;

                case "vis":
                    appBar.contentName("search")!.show();
                    break;

                case "visData":
                    appBar.contentName("search")!.show();
                    appBar.contentName("edit")!.show();
                    break;

                case "visDataEdit":
                    appBar.contentName("trash")!.show();
                    break;

                case "special":
                    switch ((current.children[0] as app.PGPageContentSpecial).data?.type) {
                        case "flakes":
                            appBar.contentName("printer")!.show();
                            appBar.contentName("search")!.show();
                            break;
                    }
                    break;
            }
        });
    }

    private storeEventHandlers() {
        const store = PGApp.queryStore();

        store.addListener(
            "theme",
            (data) => {
                const themeHandler = PGApp.queryThemeHandler();
                themeHandler.theme = data.name;
            },
            true,
        );

        this.createDrawerGroupItems(store, "alertLists");
        this.createDrawerGroupItems(store, "metalSheets");
        this.createDrawerGroupItems(store, "vis");
        this.createDrawerGroupItems(store, "visBookmarks");
        this.createDrawerGroupItems(store, "visData");
        this.createDrawerGroupItems(store, "special");
    }

    private createDrawerGroupItems(
        store: types.PGStore,
        storeKey: keyof lib.listStores.ListStoreData,
    ) {
        store.addListener(
            storeKey,
            (data) => {
                const groupContainer = this.querySelector(`ui-drawer-group[name="${storeKey}"]`)!;

                const fixedItems = parseInt(groupContainer.getAttribute("data-fixed-items") || "0");

                Array.from(groupContainer.children)
                    .slice(fixedItems)
                    .forEach((child) => groupContainer.removeChild(child));

                const listsStore = lib.listStore(storeKey);
                data.forEach(async (list) => {
                    const item = new UIDrawerGroupItem();
                    groupContainer.appendChild(item);

                    const groupItem = new app.PGDrawerItem();
                    item.appendChild(groupItem);

                    groupItem.storeKey = listsStore.key();
                    groupItem.storeListKey = listsStore.listKey(list);
                    groupItem.primary = listsStore.listKey(list);

                    switch (storeKey) {
                        case "metalSheets":
                            ((list: types.MetalSheet) => {
                                groupItem.primary =
                                    (list.data.press >= 0 ? `[P${list.data.press}] ` : "") +
                                    listsStore.listKey(list);
                                groupItem.secondary = `${(list as types.MetalSheet).data.table.data.length} Einträge`;
                            })(list as types.MetalSheet);
                            break;
                        default:
                            groupItem.secondary = `${(list as types.AlertList | types.Vis | types.VisData).data.length} Einträge`;
                    }

                    groupItem.allowDeletion = true;
                });
            },
            true,
        );
    }
}

export default PGApp;
