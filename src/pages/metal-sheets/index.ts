import * as globals from "../../globals";
import * as query from "../../utils-query";

let cleanup: (() => void)[] = [];
let originTitle: string = "";

export async function onMount() {
    const param = query.getSearchParam();
    const list = globals.getMetalSheet(param.listKey);
    if (!list) {
        throw new Error(`alert list not found: listKey=${param.listKey}`);
    }

    const appBarTitle = query.appBar_Title();
    originTitle = appBarTitle.innerText;
    appBarTitle.innerText =
        list.data.press > -1
            ? `[P${list.data.press}] ${list.format} ${list.toolID}`
            : `${list.format} ${list.toolID}`;

    render(list.data.table.header, list.data.table.data, param.listKey);
}

export async function onDestroy() {
    cleanup.forEach((fn) => fn());
    cleanup = [];
    query.appBar_Title().innerText = originTitle;
}

function render(_header: string[], _data: string[][], _listKey: string) {
    // TODO: ...
}
