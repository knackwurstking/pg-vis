import * as ui from "ui";

import * as create from "./create";
import * as globals from "../../globals";
import * as types from "../../types";
import * as query from "../../utils-query";
import * as utils from "../../utils";

let cleanup: (() => void)[] = [];
let originTitle: string = "";
export async function onMount() {
    const param = ui.router.hash.getSearchParam();

    const list = globals.getVis(param.listKey);
    if (!list) {
        throw new Error(`alert list not found: listKey=${param.listKey}`);
    }

    // Set the app bar title
    {
        const appBarTitle = query.appBar_Title();
        originTitle = appBarTitle.innerText;
        appBarTitle.innerText = list.title;
    }

    render(list, param.listKey);
}

export async function onDestroy() {
    cleanup.forEach((fn) => fn());
    cleanup = [];
    query.appBar_Title().innerText = originTitle;
}

function render(list: types.Vis, _listKey: string) {
    const target = query.routerTarget();
    const searchBarInput = target.querySelector<HTMLInputElement>(
        `.search-bar input[type="search"]`,
    )!;
    const productsContainer = target.querySelector<HTMLUListElement>(`.products`)!;

    list.data.forEach((product) => {
        setTimeout(() => {
            const item = create.productItem({ product }); // TODO: enableRouting to the product page
            cleanup.push(item.destroy);
            productsContainer.appendChild(item.element);
        });
    });

    searchBarInput.oninput = () => {
        const r = utils.generateRegExp(searchBarInput.value);
        for (const item of [...productsContainer.children]) {
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
