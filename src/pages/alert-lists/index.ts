import * as globals from "../../globals";
import * as listsStore from "../../list-stores";
import * as query from "../../utils-query";

const ls = listsStore.get("alert-lists");

let originTitle: string = "";

export async function onMount() {
    const param = query.getSearchParam();

    const list = globals.store.get("alert-lists")!.lists.find((list) => {
        return ls.listKey(list) === param.listKey;
    });
    if (!list) {
        throw new Error(`Unknown list key: ${param.listKey}`);
    }

    const appBarTitle = query.appBar_Title();
    originTitle = appBarTitle.innerText;
    appBarTitle.innerText = decodeURIComponent(list.title);

    console.debug(list); // TODO: Render items and init app bar action buttons
}

export async function onDestroy() {
    query.appBar_Title().innerText = originTitle;
}
