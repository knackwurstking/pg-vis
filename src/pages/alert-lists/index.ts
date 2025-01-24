import * as globals from "../../globals";
import * as listsStore from "../../list-stores";
import * as types from "../../types";
import * as query from "../../utils-query";
import * as create from "./create";

const ls = listsStore.get("alert-lists");

let cleanup: (() => void)[] = [];
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

    renderAlerts(list.data);
}

export async function onDestroy() {
    cleanup.forEach((fn) => fn());
    cleanup = [];
    query.appBar_Title().innerText = originTitle;
}

function renderAlerts(alerts: types.Alert[]) {
    const container = document.querySelector<HTMLUListElement>(`.alerts`)!;

    for (const alert of alerts) {
        const item = create.alertItem(alert, { enableRouting: true });
        cleanup.push(item.destroy);
        container.appendChild(item.element);
    }
}
