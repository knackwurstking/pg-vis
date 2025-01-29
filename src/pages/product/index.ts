import * as ui from "ui";

import * as globals from "../../globals";
import * as types from "../../types";
import * as query from "../../utils-query";
import * as visCreate from "../vis/create";

interface Param {
    listKey?: string;
    index?: string;
}

let cleanup: (() => void)[] = [];
let originTitle: string = "";

export async function onMount() {
    const param: Param = ui.router.hash.getSearchParam();

    // Get product from vis
    const product = globals.getProduct(param.listKey || "", parseInt(param.index || "-1", 10));
    if (!product) {
        throw `product not found: listKey=${param.listKey}, index=${param.index}`;
    }

    // Set app bar title
    {
        const appBarTitle = query.appBar_Title();
        originTitle = appBarTitle.innerText;
        appBarTitle.innerText = `${product.lotto}`;
    }

    // Enable back button
    {
        const backButton = query.appBar_ButtonBack();
        backButton.style.display = "inline-flex";
        cleanup.push(() => (backButton.style.display = "none"));
    }

    render(product);
}

export async function onDestroy() {
    cleanup.forEach((fn) => fn());
    cleanup = [];

    query.appBar_Title().innerText = originTitle;
}

function render(product: types.Product) {
    // Render product item to ".product-item-container"
    const itemContainer = query.routerTarget().querySelector(`.product-item-container`)!;
    const item = visCreate.productItem({ product });
    itemContainer.appendChild(item.element);
    cleanup.push(() => item.destroy);

    // TODO: Render data for this product to ".product-data"
    const productData = query.routerTarget().querySelector(`.product-data`)!;
    // Check vis data and render entries matching this product
}
