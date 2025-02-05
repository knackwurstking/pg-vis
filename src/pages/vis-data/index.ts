import * as ui from "ui";

import * as dialogs from "../../dialogs";
import * as globals from "../../globals";
import * as listStores from "../../list-stores/";
import * as types from "../../types";
import * as utils from "../../utils";
import * as query from "../../utils-query";

interface Param {
    listKey?: string;
    scrollTop?: string;
}

let cleanup: types.CleanUp[] = [];
let search: string = "";
let scrollTop: number = 0;

export async function onMount() {
    const param: Param = ui.router.hash.getSearchParam();

    const visData = globals.getVisData(param.listKey || "");
    if (!visData) {
        throw new Error(`vis data list "${param.listKey}" not found`);
    }

    // Set the app bar title
    cleanup.push(utils.setAppBarTitle(visData.title));

    if (!!param.scrollTop) {
        scrollTop = parseInt(param.scrollTop, 10);
    }

    setupAppBarEditButton(visData);
    setupAppBarAddButton(visData);
    render(visData, param.listKey!);
}

export async function onDestroy() {
    const el = routerTargetElements();

    search = el.searchBarInput.value;
    scrollTop = el.dataList.parentElement?.scrollTop || 0;

    cleanup.forEach((fn) => fn());
    cleanup = [];
}

function setupAppBarEditButton(visData: types.VisData) {
    const listEditButton = query.appBar_ButtonListEdit();

    listEditButton.onclick = async () => {
        const data = await dialogs.visData(visData);

        if (!data) {
            return;
        }

        try {
            const ls = listStores.get("vis-data");
            ls.replaceInStore(data, visData);
            ui.router.hash.goTo(
                {
                    listKey: ls.listKey(data),
                },
                "vis-data",
            );
        } catch (err) {
            alert(err);
            listEditButton.click();
            return;
        }
    };

    listEditButton.style.display = "inline-flex";

    cleanup.push(() => {
        listEditButton.style.display = "none";
        listEditButton.onclick = null;
    });
}

function setupAppBarAddButton(visData: types.VisData) {
    const addButton = query.appBar_ButtonAdd();

    addButton.onclick = async () => {
        const data: types.VisDataEntry | null = await dialogs.visDataEntry();
        if (!data) {
            return;
        }

        // TODO: Validate data, "value" cannot be empty

        visData.data.push(data);

        const ls = listStores.get("vis-data");
        ls.replaceInStore(visData);
        reload();
    };

    addButton.style.display = "inline-flex";

    cleanup.push(() => {
        addButton.style.display = "none";
        addButton.onclick = null;
    });
}

function render(visData: types.VisData, listKey: string) {
    const el = routerTargetElements();

    el.dataList.innerHTML = "";

    // TODO: Render products

    // Search bar
    el.searchBarInput.oninput = () => {
        const r = utils.generateRegExp(el.searchBarInput.value);
        for (const item of [...el.dataList.children]) {
            if (item.textContent === null) {
                continue;
            }

            if (!!item.textContent.replace(/(\n|\r|\s+)/g, " ").match(r)) {
                // Show
                (item as HTMLElement).style.display = "flex";
            } else {
                (item as HTMLElement).style.display = "none";
            }
        }
    };

    el.searchBarInput.value = search;
    setTimeout(() => {
        el.searchBarInput.oninput!(new Event("input"));
    });
}

async function reload() {
    await onDestroy();
    await onMount();
}

function routerTargetElements() {
    const rt = query.routerTarget();

    return {
        searchBarInput: rt.querySelector<HTMLInputElement>(`.search-bar input[type="search"]`)!,
        dataList: rt.querySelector<HTMLUListElement>(`.data-list`)!,
    };
}
