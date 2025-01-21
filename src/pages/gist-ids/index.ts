import * as query from "../../utils-query";

let originTitle: string = "";

export async function onMount() {
    const appBarTitle = query.appBar_Title();
    originTitle = appBarTitle.innerText;
    appBarTitle.innerText = "Gist IDs";
}

export async function onDestroy() {
    query.appBar_Title().innerText = originTitle;
}
