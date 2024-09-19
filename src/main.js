import { register } from "ui";
import { registerSW } from "virtual:pwa-register";
import "../node_modules/ui/css/main.css";

import {
  AlertListsPage,
  AlertPage,
  BookmarkDialog,
  ImportDialog,
  MetalSheetCreateDialog,
  MetalSheetListsPage,
  NewVisDataDialog,
  PGAppBar,
  PGDrawer,
  ProductPage,
  PushDialog,
  PGSearchBar,
  VisDataEntryPage,
  VisDataPage,
  VisListsPage,
  VisPage,
} from "./components";
import { version } from "./data/version";
import { PGApp } from "./pg-app";

registerSW({
  onRegistered(r) {
    setTimeout(async () => {
      try {
        console.debug(`[main] Update service... (currentVersion: ${version})`);
        await r.update(); // NOTE: for now do auto update all the time
      } catch (err) {
        console.warn(`Auto update failed: ${err}`);
      }
    });
  },
});

register();

BookmarkDialog.register();
ImportDialog.register();
MetalSheetCreateDialog.register();
NewVisDataDialog.register();
PushDialog.register();

AlertPage.register();
AlertListsPage.register();
MetalSheetListsPage.register();
ProductPage.register();
VisPage.register();
VisDataPage.register();
VisDataEntryPage.register();
VisListsPage.register();

PGDrawer.register();
PGSearchBar.register();
PGAppBar.register();

PGApp.register();
