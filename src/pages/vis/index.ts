import * as ui from "ui";

import * as globals from "../../globals";
import * as types from "../../types";
import * as query from "../../utils-query";

let cleanup: (() => void)[] = [];
let originTitle: string = "";
export async function onMount() {
    const param = ui.router.hash.getSearchParam();

    const list = globals.getVis(param.listKey);
    if (!list) {
        throw new Error(`alert list not found: listKey=${param.listKey}`);
    }

    // Render the app bar title
    {
        const appBarTitle = query.appBar_Title();
        originTitle = appBarTitle.innerText;
        appBarTitle.innerText = list.title;
    }

    render(list, param.listKey);
}

export async function onDestroy() {
    cleanup.forEach((fn) => fn());
    cleanup = [];
    query.appBar_Title().innerText = originTitle;
}

function render(list: types.Vis, listKey: string) {
    const target = query.routerTarget();
    const searchBarInput = target.querySelector<HTMLInputElement>(
        `.search-bar input[type="search"]`,
    )!;
    const productsContainer = target.querySelector<HTMLUListElement>(`.products`)!;

    // TODO: Render products
}
