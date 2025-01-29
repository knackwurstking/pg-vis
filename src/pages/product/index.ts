import * as ui from "ui";

import * as globals from "../../globals";
import * as types from "../../types";
import * as query from "../../utils-query";

interface Param {
    listKey?: string;
    index?: string;
}

let cleanup: (() => void)[] = [];
let originTitle: string = "";

export async function onMount() {
    const param: Param = ui.router.hash.getSearchParam();

    const product = globals.getProduct(param.listKey || "", parseInt(param.index || "-1", 10));
    if (!product) {
        throw `product not found: listKey=${param.listKey}, index=${param.index}`;
    }

    {
        const appBarTitle = query.appBar_Title();
        originTitle = appBarTitle.innerText;
        appBarTitle.innerText = `${product.lotto}`;
    }

    render(product);
}

export async function onDestroy() {
    cleanup.forEach((fn) => fn());
    cleanup = [];

    query.appBar_Title().innerText = originTitle;
}

function render(product: types.Product) {
    // TODO: Render product item to ".product-item-container"
    // TODO: Render data for this product to ".product-data"
}
