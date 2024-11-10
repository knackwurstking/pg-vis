import { html, LitElement, PropertyValues } from "lit";
import { customElement } from "lit/decorators.js";
import {
    styles,
    svg,
    UIAppBar,
    UIDrawer,
    UIDrawerGroupItem,
    UIStackLayout,
    UIStackLayoutPage,
    UIThemeHandler,
    UIThemeHandlerTheme,
} from "ui";
import { build, version } from "../constants";
import { ListsStoreData, newListsStore } from "../lib/lists-store";
import { AlertList, MetalSheet, PGStackLayoutPage, PGStore, Vis, VisData } from "../store-types";
import {
    PGBookmarkSelectDialog,
    PGImportDialog,
    PGMetalSheetTableDialog,
    PGVisBookmarksDialog,
    PGVisDataDialog,
} from "./dialogs";
import {
    PGPageContentAlert,
    PGPageContentAlertLists,
    PGPageContentMetalSheets,
    PGPageContentProduct,
    PGPageContentVis,
    PGPageContentVisBookmarks,
    PGPageContentVisData,
    PGPageContentVisDataEdit,
} from "./pages";
import PGDrawerItem from "./pg-drawer-item";

@customElement("pg-app")
class PGApp extends LitElement {
    static queryStore(): PGStore {
        return document.querySelector<PGStore>("ui-store")!;
    }

    static queryThemeHandler(): UIThemeHandler {
        return document.querySelector<UIThemeHandler>("ui-theme-handler")!;
    }

    static queryAppBar(): UIAppBar | null {
        return document.querySelector<UIAppBar>("ui-app-bar") || null;
    }

    static queryDrawer(): UIDrawer | null {
        return document.querySelector<UIDrawer>("ui-drawer") || null;
    }

    static queryStackLayout(): UIStackLayout<PGStackLayoutPage> | null {
        return document.querySelector<UIStackLayout<PGStackLayoutPage>>("ui-stack-layout");
    }

    static queryImportDialog(): PGImportDialog | null {
        return document.querySelector<PGImportDialog>(`pg-import-dialog`);
    }

    static queryVisBookmarksDialog(): PGVisBookmarksDialog | null {
        return document.querySelector<PGVisBookmarksDialog>(`pg-vis-bookmarks-dialog`);
    }

    static queryBookmarkSelectDialog(): PGBookmarkSelectDialog | null {
        return document.querySelector<PGBookmarkSelectDialog>(`pg-bookmark-select-dialog`);
    }

    static queryVisDataDialog(): PGVisDataDialog | null {
        return document.querySelector<PGVisDataDialog>(`pg-vis-data-dialog`);
    }

    constructor() {
        super();
        this.initializeStores();
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
                    allowDeletion: true,
                    title: "A really long title for bookmarks here... P0",
                    data: [],
                },
                {
                    allowDeletion: true,
                    title: "P2",
                    data: [],
                },
                {
                    allowDeletion: true,
                    title: "P3",
                    data: [],
                },
                {
                    allowDeletion: true,
                    title: "P4",
                    data: [],
                },
                {
                    allowDeletion: true,
                    title: "P5",
                    data: [],
                },
            ],
            false,
        ); // NOTE: Dummy Data
        store.setData("visData", [], true);

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

            ${this.renderAppBar()} ${this.renderDrawer()} ${this.renderDialogs()}
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
                                const dialog = this.querySelector<PGMetalSheetTableDialog>(
                                    `pg-metal-sheet-table-dialog`,
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
                    <!-- TODO: Import/Export -->
                    <span class="placeholder"></span>

                    <!-- Fixed Item 2 -->
                    <!-- TODO: Gist -->
                    <span class="placeholder"></span>
                </ui-drawer-group>
            </ui-drawer>
        `;
    }

    private renderDialogs() {
        return html`
            <pg-import-dialog></pg-import-dialog>

            <pg-metal-sheet-table-dialog
                title="Neue Liste"
                @submit=${(ev: Event & { currentTarget: PGMetalSheetTableDialog }) => {
                    const format = ev.currentTarget.format;
                    const toolID = ev.currentTarget.toolID;
                    const press = ev.currentTarget.press;

                    const reopenDialog = () => {
                        const dialog = this.querySelector<PGMetalSheetTableDialog>(
                            `pg-metal-sheet-table-dialog`,
                        )!;

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
                                header: [],
                                data: [],
                            },
                        },
                    };

                    const listsStore = newListsStore("metalSheets");
                    const newListKey = listsStore.listKey(newData);

                    for (const list of store.getData("metalSheets") || []) {
                        if (listsStore.listKey(list) === newListKey) {
                            setTimeout(reopenDialog);

                            alert(`Liste "${newListKey}" existiert bereits!"`);
                            return;
                        }
                    }

                    listsStore.addToStore(store, [], true);
                }}
            ></pg-metal-sheet-table-dialog>

            <pg-vis-data-dialog
                @submit=${(ev: Event & { currentTarget: PGVisDataDialog }) => {
                    const title = ev.currentTarget.title;
                    const listsStore = newListsStore("visData");

                    try {
                        listsStore.addToStore(
                            PGApp.queryStore(),
                            [
                                {
                                    title: title,
                                    data: [],
                                },
                            ],
                            true,
                        );
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
                @submit=${(ev: Event & { currentTarget: PGVisBookmarksDialog }) => {
                    const title = ev.currentTarget.title;
                    const listsStore = newListsStore("visBookmarks");

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

    private registerPages() {
        const stack = PGApp.queryStackLayout()!;

        // Main pages

        stack.registerPage("alertLists", () => {
            const page = new UIStackLayoutPage();
            page.name = "alertLists";
            page.appendChild(new PGPageContentAlertLists());
            return page;
        });

        stack.registerPage("metalSheets", () => {
            const page = new UIStackLayoutPage();
            page.name = "metalSheets";
            page.appendChild(new PGPageContentMetalSheets());
            return page;
        });

        stack.registerPage("vis", () => {
            const page = new UIStackLayoutPage();
            page.name = "vis";
            page.appendChild(new PGPageContentVis());
            return page;
        });

        stack.registerPage("visBookmarks", () => {
            const page = new UIStackLayoutPage();
            page.name = "visBookmarks";
            page.appendChild(new PGPageContentVisBookmarks());
            return page;
        });

        stack.registerPage("visData", () => {
            const page = new UIStackLayoutPage();
            page.name = "visData";
            page.appendChild(new PGPageContentVisData());
            return page;
        });

        // Sub pages

        stack.registerPage("alert", () => {
            const page = new UIStackLayoutPage();
            page.name = "alert";
            page.appendChild(new PGPageContentAlert());
            return page;
        });

        stack.registerPage("product", () => {
            const page = new UIStackLayoutPage();
            page.name = "product";
            page.append(new PGPageContentProduct());
            return page;
        });

        stack.registerPage("visDataEdit", () => {
            const page = new UIStackLayoutPage();
            page.name = "visDataEdit";
            page.append(new PGPageContentVisDataEdit());
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

            switch (current.name as PGStackLayoutPage) {
                case "alertLists":
                    appBar.contentName("search")!.show();
                    break;

                case "metalSheets":
                    appBar.contentName("edit")!.show();
                    break;

                case "vis":
                    appBar.contentName("search")!.show();
                    break;

                case "visData":
                    appBar.contentName("edit")!.show();
                    break;

                case "visDataEdit":
                    appBar.contentName("trash")!.show();
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

        this.drawerGroupItemsRendering(store, "alertLists");
        this.drawerGroupItemsRendering(store, "metalSheets");
        this.drawerGroupItemsRendering(store, "vis");
        this.drawerGroupItemsRendering(store, "visBookmarks");
        this.drawerGroupItemsRendering(store, "visData");
    }

    private drawerGroupItemsRendering(store: PGStore, storeKey: keyof ListsStoreData) {
        store.addListener(
            storeKey,
            (data) => {
                const groupContainer = this.querySelector(`ui-drawer-group[name="${storeKey}"]`)!;

                const fixedItems = parseInt(groupContainer.getAttribute("data-fixed-items") || "0");

                Array.from(groupContainer.children)
                    .slice(fixedItems)
                    .forEach((child) => groupContainer.removeChild(child));

                const listsStore = newListsStore(storeKey);
                data.forEach(async (list) => {
                    const item = new UIDrawerGroupItem();
                    groupContainer.appendChild(item);

                    const groupItem = new PGDrawerItem();
                    item.appendChild(groupItem);

                    groupItem.storeKey = listsStore.key();
                    groupItem.storeListKey = listsStore.listKey(list);
                    groupItem.primary = listsStore.listKey(list);

                    switch (storeKey) {
                        case "metalSheets":
                            ((list: MetalSheet) => {
                                groupItem.primary =
                                    (list.data.press >= 0 ? `[P${list.data.press}] ` : "") +
                                    listsStore.listKey(list);
                                groupItem.secondary = `${(list as MetalSheet).data.table.data.length} Einträge`;
                            })(list as MetalSheet);
                            break;
                        default:
                            groupItem.secondary = `${(list as AlertList | Vis | VisData).data.length} Einträge`;
                    }

                    groupItem.allowDeletion = true;
                });
            },
            true,
        );
    }
}

export default PGApp;
