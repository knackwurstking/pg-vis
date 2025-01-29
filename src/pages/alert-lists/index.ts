import * as ui from "ui";

import * as globals from "../../globals";
import * as types from "../../types";
import * as utils from "../../utils";
import * as query from "../../utils-query";
import * as create from "./create";

interface Param {
    listKey?: string;
}

let cleanup: (() => void)[] = [];
let originTitle: string = "";

export async function onMount() {
    const param: Param = ui.router.hash.getSearchParam();

    const list = globals.getAlertList(param.listKey || "");
    if (!list) {
        throw new Error(`alert list not found: listKey=${param.listKey}`);
    }

    const appBarTitle = query.appBar_Title();
    originTitle = appBarTitle.innerText;
    appBarTitle.innerText = list.title;

    render(list.data, param.listKey || "");
}

export async function onDestroy() {
    cleanup.forEach((fn) => fn());
    cleanup = [];
    query.appBar_Title().innerText = originTitle;
}

function render(alerts: types.Alert[], listKey: string) {
    const target = query.routerTarget();
    const searchBarInput = target.querySelector<HTMLInputElement>(
        `.search-bar input[type="search"]`,
    )!;
    const alertsContainer = target.querySelector<HTMLUListElement>(`.alerts`)!;

    alerts.forEach((alert, i) => {
        setTimeout(() => {
            const item = create.alertItem({
                alert: alert,
                enableRouting: {
                    alertIndex: i,
                    listKey,
                },
            });
            cleanup.push(item.destroy);
            alertsContainer.appendChild(item.element);
        });
    });

    searchBarInput.oninput = () => {
        const r = utils.generateRegExp(searchBarInput.value);
        for (const item of [...alertsContainer.children]) {
            if (item.textContent === null) {
                continue;
            }

            if (!!item.textContent.match(r)) {
                // Show
                (item as HTMLElement).style.display = "flex";
            } else {
                (item as HTMLElement).style.display = "none";
            }
        }
    };
}
