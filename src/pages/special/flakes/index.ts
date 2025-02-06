import * as ui from "ui";

import * as dialogs from "../../../dialogs";
import * as globals from "../../../globals";
import * as listStores from "../../../list-stores";
import * as types from "../../../types";
import * as utils from "../../../utils";
import * as query from "../../../utils-query";
import * as create from "./create";

interface Param {
    listKey?: string;
}

let cleanup: types.CleanUp[] = [];

export async function onMount() {
    const param: Param = ui.router.hash.getSearchParam();

    const flakes = globals.store.get("special")!.lists.find((list) => list.type === "flakes");
    if (!flakes) {
        throw new Error(`flakes special list "${param.listKey}" not found`);
    }

    cleanup.push(utils.setAppBarTitle(flakes.title));

    setupAppBarAddButton(flakes);
    render(flakes);
}

export async function onDestroy() {
    cleanup.forEach((fn) => fn());
    cleanup = [];
}

function setupAppBarAddButton(flakes: types.SpecialFlakes) {
    const addButton = query.appBar_ButtonAdd();

    addButton.onclick = async () => {
        const data: types.SpecialFlakesEntry | null = await dialogs.specialFlakesEntry();
        if (!data) return;
        flakes.data.push(data);

        const ls = listStores.get("special");
        ls.replaceInStore(flakes);
        reload();
    };

    addButton.style.display = "inline-flex";

    cleanup.push(() => {
        addButton.style.display = "none";
        addButton.onclick = null;
    });
}

function render(flakes: types.SpecialFlakes) {
    const el = routerTargetElements();

    el.tableContainer.innerHTML = "";

    globals.flakesPressSlots
        .map((slot, index) =>
            create.table(
                globals.flakesPressSlotsFull[index],
                flakes.data.filter((entry) => entry.press === slot),
                async (entries) => {
                    flakes.data = [
                        ...flakes.data.filter((entry) => entry.press !== slot),
                        ...entries,
                    ];

                    const ls = listStores.get("special");
                    ls.replaceInStore(flakes);
                    reload();
                },
            ),
        )
        .forEach((table) => {
            el.tableContainer.appendChild(table.element);
            cleanup.push(table.destroy);
        });
}

async function reload() {
    await onDestroy();
    await onMount();
}

function routerTargetElements(): {
    tableContainer: HTMLUListElement;
} {
    const rt = query.routerTarget();

    return {
        tableContainer: rt.querySelector(`.table-container`)!,
    };
}
