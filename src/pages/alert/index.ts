import * as ui from "ui";

import * as globals from "../../globals";
import * as types from "../../types";
import * as query from "../../utils-query";
import * as createAlertLists from "../alert-lists/create";
import * as create from "./create";

let cleanup: (() => void)[] = [];
let originTitle: string = "";

export async function onMount() {
    const param = ui.router.hash.getSearchParam();

    const alert = globals.getAlert(param.listKey, parseInt(param.index, 10));
    if (!alert) {
        throw `alert not found: listKey=${param.listKey}, index=${param.index}`;
    }

    const appBarTitle = query.appBar_Title();
    originTitle = appBarTitle.innerText;
    appBarTitle.innerText = `${
        alert.from === alert.to ? `${alert.from}` : `${alert.from}..${alert.to}`
    }`;

    // Enable back button
    const backButton = query.appBar_ButtonBack();
    backButton.style.display = "inline-flex";
    cleanup.push(() => {
        backButton.style.display = "none";
    });

    render(alert);
}

export async function onDestroy() {
    cleanup.forEach((fn) => fn());
    cleanup = [];
    query.appBar_Title().innerText = originTitle;
}

function render(alert: types.Alert) {
    const routerTarget = query.routerTarget();
    const alertContainer = routerTarget.querySelector(`.alert`)!;
    const descContainer = routerTarget.querySelector(`.desc`)!;

    // Reset, just in case
    alertContainer.innerHTML = "";
    descContainer.innerHTML = "";

    const alertItem = createAlertLists.alertItem({ alert: alert });

    alertContainer?.appendChild(alertItem.element);
    cleanup.push(alertItem.destroy);

    const descItem = create.alertDescription({ alert });
    descContainer.appendChild(descItem.element);
    cleanup.push(descItem.destroy);
}
