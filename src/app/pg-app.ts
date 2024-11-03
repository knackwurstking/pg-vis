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
import { newListsStore } from "../lib/lists-store";
import { PGStackLayoutPage, PGStore } from "../store-types";
import PGImportDialog from "./dialogs/pg-import-dialog";
import PGMetalSheetTableDialog from "./dialogs/pg-metal-sheet-table-dialog";
import {
    PGPageContentAlert,
    PGPageContentAlertLists,
    PGPageContentMetalSheets,
    PGPageContentVis,
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
        return document.querySelector<UIStackLayout<PGStackLayoutPage>>(
            "ui-stack-layout",
        );
    }

    static queryImportDialog(): PGImportDialog | null {
        return document.querySelector<PGImportDialog>(`pg-import-dialog`);
    }

    constructor() {
        super();
        this._initializeStores();
    }

    private _initializeStores() {
        const store = PGApp.queryStore();

        store.setData("theme", { name: "original" }, true);

        // NOTE: Always open the drawer on app start for now
        store.setData("drawer", { open: true }, false);

        store.setData("drawerGroup", {}, true);

        store.setData("alertLists", [], true);
        store.setData("metalSheets", [], true);
        store.setData("vis", [], true);

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

            ${this._renderAppBar()} ${this._renderDrawer()}
            ${this._renderDialogs()}
        `;
    }

    private _renderAppBar() {
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

    private _renderDrawer() {
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
                                    ?selected=${store.getData("theme")?.name ===
                                    "original"}
                                >
                                    Original
                                </option>
                                <option
                                    value="gruvbox"
                                    ?selected=${store.getData("theme")?.name ===
                                    "gruvbox"}
                                >
                                    Gruvbox
                                </option>
                            </select>
                        </ui-label>
                    </ui-drawer-group-item>
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
                    <ui-drawer-group-item>
                        <pg-drawer-item-import
                            store-key="alertLists"
                        ></pg-drawer-item-import>
                    </ui-drawer-group-item>

                    <!-- Fixed Item 2 -->
                    <ui-drawer-group-item>
                        <pg-drawer-item-gist
                            store-key="alertLists"
                        ></pg-drawer-item-gist>
                    </ui-drawer-group-item>
                </ui-drawer-group>

                <ui-drawer-group
                    name="metal-sheets"
                    title="Blech Listen"
                    data-fixed-items="3"
                    gap="0.25rem"
                    ?open=${!!store.getData("drawerGroup")?.["metal-sheets"]
                        ?.open}
                    @fold=${() => {
                        store.updateData(`drawerGroup`, (data) => {
                            data["metal-sheets"] = { open: false };
                            return data;
                        });
                    }}
                    @unfold=${() => {
                        store.updateData(`drawerGroup`, (data) => {
                            data["metal-sheets"] = { open: true };
                            return data;
                        });
                    }}
                >
                    <!-- Fixed Item 1 -->
                    <ui-drawer-group-item>
                        <pg-drawer-item-import
                            store-key="metalSheets"
                        ></pg-drawer-item-import>
                    </ui-drawer-group-item>

                    <!-- Fixed Item 2 -->
                    <ui-drawer-group-item>
                        <pg-drawer-item-gist
                            store-key="metalSheets"
                        ></pg-drawer-item-gist>
                    </ui-drawer-group-item>

                    <!-- Fixed Item 3 -->
                    <ui-drawer-group-item>
                        <ui-button
                            variant="full"
                            color="secondary"
                            @click=${() => {
                                const dialog =
                                    this.querySelector<PGMetalSheetTableDialog>(
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

    private _renderDialogs() {
        return html`
            <pg-import-dialog></pg-import-dialog>

            <pg-metal-sheet-table-dialog
                title="Neue Liste"
                @submit=${(
                    ev: Event & { currentTarget: PGMetalSheetTableDialog },
                ) => {
                    const format = ev.currentTarget.format;
                    const toolID = ev.currentTarget.toolID;
                    const press = ev.currentTarget.press;

                    const reopenDialog = () => {
                        const dialog =
                            this.querySelector<PGMetalSheetTableDialog>(
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
        `;
    }

    protected firstUpdated(_changedProperties: PropertyValues): void {
        this.style.position = "fixed";
        this.style.top = "0";
        this.style.right = "0";
        this.style.bottom = "0";
        this.style.left = "0";

        this._registerPages();
        this._handleStackLayoutChanges();
        this._storeEventHandlers();
    }

    private _registerPages() {
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

        // TODO: Register "vis-bookmarks" and "vis-data"

        // Sub pages

        stack.registerPage("alert", () => {
            const page = new UIStackLayoutPage();
            page.name = "alert";
            page.appendChild(new PGPageContentAlert());
            return page;
        });

        // TODO: Register "product", "product-info", "vis-data-edit"
    }

    private _handleStackLayoutChanges() {
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

                case "vis":
                    appBar.contentName("search")!.show();
                    break;
            }
        });
    }

    private _storeEventHandlers() {
        const store = PGApp.queryStore();

        store.addListener(
            "theme",
            (data) => {
                const themeHandler = PGApp.queryThemeHandler();
                themeHandler.theme = data.name;
            },
            true,
        ),
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
                        const item = new UIDrawerGroupItem();
                        groupContainer.appendChild(item);

                        const groupItem = new PGDrawerItem();
                        item.appendChild(groupItem);

                        groupItem.storeKey = listsStore.key();

                        groupItem.primary = groupItem.storeListKey =
                            listsStore.listKey(list);

                        groupItem.secondary = `${list.data.length} Einträge`;
                        groupItem.allowDeletion = true;
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
                    const item = new UIDrawerGroupItem();
                    groupContainer.appendChild(item);

                    const groupItem = new PGDrawerItem();
                    item.appendChild(groupItem);

                    groupItem.storeKey = listsStore.key();

                    groupItem.primary =
                        (list.data.press >= 0 ? `[P${list.data.press}] ` : "") +
                        listsStore.listKey(list);

                    groupItem.storeListKey = listsStore.listKey(list);
                    groupItem.secondary = `${list.data.table.data.length} Einträge`;
                    groupItem.allowDeletion = true;
                });
            },
            true,
        );

        store.addListener(
            "vis",
            (data) => {
                const groupContainer = this.querySelector(
                    `ui-drawer-group[name="vis"]`,
                )!;

                const fixedItems = parseInt(
                    groupContainer.getAttribute("data-fixed-items") || "0",
                );

                Array.from(groupContainer.children)
                    .slice(fixedItems)
                    .forEach((child) => groupContainer.removeChild(child));

                const listsStore = newListsStore("vis");
                data.forEach(async (list) => {
                    const item = new UIDrawerGroupItem();
                    groupContainer.appendChild(item);

                    const groupItem = new PGDrawerItem();
                    item.appendChild(groupItem);

                    groupItem.storeKey = listsStore.key();
                    groupItem.primary = listsStore.listKey(list);
                    groupItem.storeListKey = listsStore.listKey(list);
                    groupItem.secondary = `${list.data.length} Einträge`;
                    groupItem.allowDeletion = true;
                });
            },
            true,
        );
    }
}

export default PGApp;
