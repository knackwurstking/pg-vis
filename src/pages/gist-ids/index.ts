import * as query from "../../utils-query";
import * as init from "./init";

let originTitle: string = "";

export async function onMount() {
    const appBarTitle = query.appBar_Title();
    originTitle = appBarTitle.innerText;
    appBarTitle.innerText = "Gist IDs";

    init.appBar();
    init.gistIDInputs();
    init.autoUpdatesCheckboxes();
}

export async function onDestroy() {
    query.appBar_Title().innerText = originTitle;
}
