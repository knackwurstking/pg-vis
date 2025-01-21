import * as globals from "../../globals";
import * as types from "../../types";
import * as query from "../../utils-query";

let originTitle: string = "";

export async function onMount() {
    const appBarTitle = query.appBar_Title();
    originTitle = appBarTitle.innerText;
    appBarTitle.innerText = "Gist IDs";

    gistIDInputs();
    autoUpdatesCheckboxes();
}

export async function onDestroy() {
    query.appBar_Title().innerText = originTitle;
}

function gistIDInputs() {
    const inputElements = document.querySelectorAll<HTMLInputElement>(
        `.gist-ids .gist-id-container input[type="text"]`,
    );

    const validIDs: { [key: string]: { storeKey: types.DrawerGroups } } = {
        gistID_AlertLists: { storeKey: "alert-lists" },
        gistID_MetalSheets: { storeKey: "metal-sheets" },
        gistID_VIS: { storeKey: "vis" },
        gistID_VISData: { storeKey: "vis-data" },
        gistID_Special: { storeKey: "special" },
    };

    for (const el of inputElements) {
        if (!Object.keys(validIDs).includes(el.id)) {
            throw new Error(`unknown id "${el.id}"`);
        }

        el.onblur = async () => {
            const drawerGroup = validIDs[el.id].storeKey;
            const gistID = el.value;

            if (!gistID) {
                globals.store.update(drawerGroup, (data) => {
                    data.gist = null;
                    return data;
                });
                return;
            }

            globals.store.update(drawerGroup, (data) => {
                data.gist = {
                    id: gistID,
                    revision: -1,
                };
                return data;
            });

            // TODO: Import from gist here...
        };
    }
}

function autoUpdatesCheckboxes() {
    // TODO: ...
}
