import { version } from "jszip";
import { CleanUp, html } from "ui";
import {
  AlertListsPage,
  AlertPage,
  MetalSheetListsPage,
  ProductPage,
  VisDataEntryPage,
  VisDataPage,
  VisListsPage,
  VisPage,
} from "./components";
import { pages } from "./data/constants";
import { build } from "./data/version";

export class PGApp extends HTMLElement {
  static register = () => {
    customElements.define("pg-app", PGApp);
  };

  constructor() {
    super();

    this.cleanup = new CleanUp();

    /** @type {PGStore} */
    this.uiStore = null;

    /** @type {import("ui").UIStackLayout} */
    this.stackLayout = null;

    /** @type {import("./components/pg-app-bar").PGAppBar} */
    this.pgAppBar = null;

    /** @type {import("./components/pg-drawer").PGDrawer} */
    this.pgDrawer = null;

    this.render();
  }

  render() {
    this.innerHTML = html`
      <ui-store storageprefix="pg-vis:" storage></ui-store>
      <ui-theme-handler auto></ui-theme-handler>

      <ui-container style="width: 100%; height: 100%;">
        <ui-stack-layout
          style="--pg-search-bar-height: 0rem;"
        ></ui-stack-layout>
      </ui-container>

      <pg-app-bar></pg-app-bar>
      <pg-drawer></pg-drawer>
    `;

    this.uiStore = this.querySelector("ui-store");
    this.stackLayout = this.querySelector("ui-stack-layout");
    this.pgAppBar = this.querySelector("pg-app-bar");
    this.pgDrawer = this.querySelector("pg-drawer");

    this.createStore();
    this.createStackLayout();
  }

  connectedCallback() {
    this.pgDrawer.ui.open = true;

    this.cleanup.add(
      this.uiStore.ui.on("appBarTitle", this.onAppBarTitle.bind(this), true),

      this.uiStore.ui.on("share", this.onShare.bind(this), true),
    );

    this.setupNoPage();

    this.handleVersion();
  }

  disconnectedCallback() {
    this.cleanup.run();
  }

  handleVersion() {
    const localVersion = localStorage.getItem("pg-vis:version");
    if (localVersion !== version) {
      localStorage.setItem("pg-vis:version", version);
      console.log(`Updated from "${localVersion}" to version "${version}"`);
    }

    const localBuild = parseInt(localStorage.getItem("pg-vis:build") || "0");
    if (localBuild !== build) {
      localStorage.setItem("pg-vis:build", build.toString());
    }
  }

  /** @private */
  createStore() {
    this.uiStore.ui.set("alertLists", [], true);
    this.uiStore.ui.set("metalSheetLists", [], true);
    this.uiStore.ui.set("vis", [], true);

    this.uiStore.ui.set(
      "visLists",
      [
        {
          name: "Presse 0",
          allowDeletion: false,
          data: [],
        },
        {
          name: "Presse 2",
          allowDeletion: false,
          data: [],
        },
        {
          name: "Presse 3",
          allowDeletion: false,
          data: [],
        },
        {
          name: "Presse 4",
          allowDeletion: false,
          data: [],
        },
        {
          name: "Presse 5",
          allowDeletion: false,
          data: [],
        },
      ],
      true,
    );

    this.uiStore.ui.set("visData", [], true);

    this.uiStore.ui.set("gist", {}, true);

    this.uiStore.ui.set("appBarTitle", "", false);
    this.uiStore.ui.set("edit", null, false);
    this.uiStore.ui.set("share", null, false);
    this.uiStore.ui.set("search", { active: false }, false);
    this.uiStore.ui.set("bookmark", { active: false }, false);
  }

  /** @private */
  createStackLayout() {
    this.stackLayout.ui.events.on("change", ({ newPage }) => {
      // Handle back button
      if (this.stackLayout.ui.size() > 1) {
        // Enable back button
        this.pgAppBar.items.back.ui.show();
      } else {
        // Disable back button
        this.pgAppBar.items.back.ui.hide();
      }

      if (!newPage) {
        this.setupNoPage();
        return;
      }

      switch (newPage.ui.name) {
        case pages.alertLists:
        case pages.alert:
        case pages.metalSheetLists:
        case pages.vis:
        case pages.product:
        case pages.visLists:
        case pages.visData:
        case pages.visDataEntry:
          this.resetAppBar();
      }

      switch (newPage.ui.name) {
        case pages.alertLists:
          this.pgAppBar.items.search.ui.show();
          break;

        case pages.metalSheetLists:
          this.pgAppBar.items.edit.ui.show();
          break;

        case pages.product:
          this.pgAppBar.items.bookmark.ui.show();
          break;

        case pages.visData:
          this.pgAppBar.items.edit.ui.show();
          break;
      }
    });

    this.stackLayout.ui.register(pages.alertLists, () => new AlertListsPage());
    this.stackLayout.ui.register(pages.alert, () => new AlertPage());

    this.stackLayout.ui.register(
      pages.metalSheetLists,
      () => new MetalSheetListsPage(),
    );

    this.stackLayout.ui.register(pages.vis, () => new VisPage());
    this.stackLayout.ui.register(pages.visLists, () => new VisListsPage());
    this.stackLayout.ui.register(pages.visData, () => new VisDataPage());

    this.stackLayout.ui.register(pages.product, () => new ProductPage());
    this.stackLayout.ui.register(
      pages.visDataEntry,
      () => new VisDataEntryPage(),
    );
  }

  /** @private */
  setupNoPage() {
    this.resetAppBar();
    this.uiStore.ui.set("appBarTitle", "PG: Vis");
    this.pgDrawer.ui.open = true;
  }

  /** @private */
  resetAppBar() {
    this.pgAppBar.items.edit.ui.hide();
    this.pgAppBar.items.share.ui.hide();
    this.pgAppBar.items.search.ui.hide();
    this.pgAppBar.items.bookmark.ui.hide();
  }

  /**
   * @private
   * @param {string} title
   */
  async onAppBarTitle(title) {
    this.pgAppBar.items.title.ui.child.innerHTML = title || "";
  }

  /**
   * @private
   * @param {ShareData} data
   */
  async onShare(data) {
    if (data !== null) {
      this.pgAppBar.items.share.ui.show();
    } else {
      this.pgAppBar.items.share.ui.hide();
    }
  }
}
