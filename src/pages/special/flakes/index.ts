import * as ui from "ui";

import * as globals from "../../../globals";
import * as utils from "../../../utils";
import * as types from "../../../types";
import * as query from "../../../utils-query";

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

    // TODO: ...
}

function routerTargetElements() {
    //const rt = query.routerTarget();

    return {};
}
