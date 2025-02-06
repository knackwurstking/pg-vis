import * as ui from "ui";

import * as globals from "../../../globals";
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

    render(flakes);
}

export async function onDestroy() {
    cleanup.forEach((fn) => fn());
    cleanup = [];
}

function render(flakes: types.SpecialFlakes) {
    const el = routerTargetElements();

    globals.flakesPressSlots
        .map((slot) => create.table(flakes.data.filter((entry) => entry.press === slot)))
        .forEach((table) => {
            el.tableContainer.appendChild(table.element);
            cleanup.push(table.destroy);
        });
}

function routerTargetElements(): {
    tableContainer: HTMLUListElement;
} {
    const rt = query.routerTarget();

    return {
        tableContainer: rt.querySelector(`.table-container`)!,
    };
}
