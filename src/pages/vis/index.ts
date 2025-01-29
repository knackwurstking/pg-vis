import * as ui from "ui";

import * as create from "./create";
import * as globals from "../../globals";
import * as types from "../../types";
import * as query from "../../utils-query";
import * as utils from "../../utils";

let cleanup: (() => void)[] = [];
let originTitle: string = "";
let search: string = "";

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
    const target = query.routerTarget();
    const searchBarInput = target.querySelector<HTMLInputElement>(
        `.search-bar input[type="search"]`,
    )!;
    search = searchBarInput.value;

    cleanup.forEach((fn) => fn());
    cleanup = [];
    query.appBar_Title().innerText = originTitle;
}

function render(list: types.Vis, listKey: string) {
    const target = query.routerTarget();
    const searchBarInput = target.querySelector<HTMLInputElement>(
        `.search-bar input[type="search"]`,
    )!;
    const productsContainer = target.querySelector<HTMLUListElement>(`.products`)!;

    list.data.forEach((product, index) => {
        // Seems to work just fine with more than 1000 items
        setTimeout(() => {
            const item = create.productItem({
                product,
                enableRouting: { productIndex: index },
            });
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

    productsContainer.onclick = (e) => {
        // Iter event path for ".product-item" element and get the "data-href" attribute
        const item = e.composedPath().find((et) => {
            const el = et as HTMLElement;
            return el.classList.contains("product-item");
        }) as HTMLElement | undefined;
        if (!item) {
            return;
        }

        ui.router.hash.goTo(
            {
                listKey: listKey,
                index: item.getAttribute("data-index")!,
            },
            "product",
        );
    };

    searchBarInput.value = search;
}
