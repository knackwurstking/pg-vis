import { UISpinner } from "ui";
import { gistPull, gistPush } from "../git";

/**
 * @param {import("../../components/pg-drawer/pg-drawer-item-gist").PGDrawerItemGist} gistItem
 * @param {PGStore_Gist} data
 * @param {Object} options
 * @param {string} options.storeGistKey - See `constants.pages`
 * @param {"alertLists" | "metalSheetLists" | "vis" | "visLists" | "visData"} options.storeDataKey
 * @param {(list: Object) => string} options.getFileName
 * @param {(data: Object) => void | Promise<void>} options.onUpdate
 */
export function gistHandler(
  gistItem,
  data,
  { storeGistKey, storeDataKey, getFileName, onUpdate },
) {
  if (!data) return;

  /**
   * @type {PGStore}
   */
  const uiStore = document.querySelector("ui-store");

  const g = data[storeGistKey];
  if (!g) {
    gistItem.set(null, null);
    gistItem.pg.onPull = null;
    gistItem.pg.onPush = null;
    return;
  }

  gistItem.set(g.id, g.revision);

  /**
   * @type {UISpinner}
   */
  let spinner;
  const spinnerStart = () => {
    if (!!spinner) gistItem.removeChild(spinner);
    spinner = new UISpinner();
    gistItem.appendChild(spinner);
  };

  const spinnerStop = () => {
    if (!spinner) return;

    gistItem.removeChild(spinner);
    spinner = undefined;
  };

  gistItem.pg.onPull = async (id, rev) => {
    spinnerStart();

    try {
      const newRevision = await gistPull(id, rev, {
        beforeUpdate: async () => {
          uiStore.ui.set(storeDataKey, []);
        },
        update: onUpdate,
      });

      uiStore.ui.update("gist", (data) => {
        data[storeGistKey] = {
          id: id,
          revision: newRevision,
        };
        return data;
      });
    } catch (err) {
      alert(err);
    } finally {
      spinnerStop();
    }
  };

  gistItem.pg.onPush = async (id, rev) => {
    spinnerStart();

    try {
      const lists = uiStore.ui.get(storeDataKey);
      if (!Array.isArray(lists)) {
        // No data to push for store key "${key}"
        throw new Error(
          `keine Daten zum Pushen für Store-Schlüssel "${storeDataKey}"`,
        );
      }

      const newRevision = await gistPush(id, rev, lists, {
        getFileName: getFileName,
      });

      uiStore.ui.update("gist", (data) => {
        data[storeGistKey] = {
          id: id,
          revision: newRevision,
        };
        return data;
      });
    } catch (err) {
      alert(err);
    } finally {
      spinnerStop();
    }
  };
}

/**
 * @param {PGStore} uiStore
 * @param {any} data
 * @param {Object} options
 * @param {"alertLists" | "metalSheetLists" | "vis" | "visLists" | "visData"} options.storeDataKey
 * @param {(data: any) => string} options.getKey
 */
export function update(uiStore, data, { storeDataKey, getKey }) {
  // Overwrite
  const key = getKey(data);
  if (
    !!uiStore.ui.get(storeDataKey).find((list) => {
      if (getKey(list) === key) return true;
      return false;
    })
  ) {
    uiStore.ui.update(storeDataKey, (lists) => {
      return lists.map((list) => {
        if (getKey(list) === key) {
          return data;
        }

        return list;
      });
    });

    return;
  }

  // Add
  uiStore.ui.update(storeDataKey, (lists) => {
    return [...lists, data];
  });
}
