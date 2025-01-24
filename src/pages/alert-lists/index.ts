import * as query from "../../utils-query";

let originTitle: string = "";

export async function onMount() {
    const param = query.getSearchParam();

    const appBarTitle = query.appBar_Title();
    originTitle = appBarTitle.innerText;
    appBarTitle.innerText = decodeURIComponent(param.listKey);

    // TODO: ...
}

export async function onDestroy() {
    query.appBar_Title().innerText = originTitle;
}
