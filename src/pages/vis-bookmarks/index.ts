import * as ui from "ui";

import * as globals from "../../globals";
import * as types from "../../types";
import * as utils from "../../utils";

interface Param {
    listKey?: string;
}

let cleanup: types.CleanUp[] = [];

export async function onMount() {
    const param: Param = ui.router.hash.getSearchParam();

    const list = globals.getVisBookmarks(param.listKey || "");
    if (!list) {
        throw new Error(`vis bookmarks "${param.listKey}" not found`);
    }

    // Set the app bar title
    cleanup.push(utils.setAppBarTitle(list.title));

    // TODO: Enable edit list item on the app bar

    render(list, param);
}

export async function onDestroy() {
    cleanup.forEach((fn) => fn());
    cleanup = [];
}

function render(list: types.Bookmarks, param: Param) {
    // TODO: Continue here...
}
