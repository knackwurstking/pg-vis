import * as globals from "../../globals";
import * as types from "../../types";
import * as query from "../../utils-query";
import * as create from "./create";
import * as utils from "../../utils";

let cleanup: (() => void)[] = [];
let originTitle: string = "";

export async function onMount() {
    const param = query.getSearchParam();

    const list = globals.getAlertList(param.listKey);
    if (!list) {
        throw new Error(`alert list not found: listKey=${param.listKey}`);
    }

    const appBarTitle = query.appBar_Title();
    originTitle = appBarTitle.innerText;
    appBarTitle.innerText = list.title;

    render(list.data, param.listKey);
}

export async function onDestroy() {
    cleanup.forEach((fn) => fn());
    cleanup = [];
    query.appBar_Title().innerText = originTitle;
}

function render(alerts: types.Alert[], listKey: string) {
    const searchBarInput = query
        .routerTarget()
        .querySelector<HTMLInputElement>(`.search-bar input[type="search"]`)!;
    const alertsContainer = query.routerTarget().querySelector<HTMLUListElement>(`.alerts`)!;

    for (let x = 0; x < alerts.length; x++) {
        const item = create.alertItem({
            alert: alerts[x],
            enableRouting: {
                alertIndex: x,
                listKey,
            },
        });
        cleanup.push(item.destroy);
        alertsContainer.appendChild(item.element);
    }

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
