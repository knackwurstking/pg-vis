import * as ui from "ui";

import * as globals from "../../globals";
import * as types from "../../types";
import * as query from "../../utils-query";
import * as visCreate from "../vis/create";
import * as visDataCreate from "../vis-data/create";

interface Param {
    listKey?: string;
    index?: string;
    tags?: string;
}

const html = String.raw;

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

    render(product, param.tags === "true" ? true : false);
}

export async function onDestroy() {
    cleanup.forEach((fn) => fn());
    cleanup = [];

    query.appBar_Title().innerText = originTitle;
}

function render(product: types.Product, renderTags: boolean) {
    // Render product item to ".product-item-container"
    const itemContainer = query.routerTarget().querySelector(`.product-item-container`)!;
    const item = visCreate.productItem({ product });
    itemContainer.appendChild(item.element);
    cleanup.push(() => item.destroy);

    // Render data for this product to ".product-data"
    const productDataContainer = query.routerTarget().querySelector(`.product-data`)!;

    // Check vis data and render entries matching this product
    globals.store.get("vis-data")!.lists.forEach((list) => {
        const details = document.createElement("details");
        details.open = true;
        details.innerHTML = html`<summary><h4>${list.title}</h4></summary>
            <ul></ul>`;

        // Filter entries matching this product
        const ul = details.querySelector("ul")!;
        list.data.forEach((entry) => {
            if (!isLotto(entry.lotto, product.lotto)) {
                return;
            }

            if (!isFormat(entry.format, product.format)) {
                return;
            }

            if (!isStamp(entry.stamp, product.stamp)) {
                return;
            }

            if (!isThickness(entry.thickness, product.thickness)) {
                return;
            }

            // Render and append entry
            const item = visDataCreate.dataItem({ entry, renderTags });
            cleanup.push(item.destroy);
            ul.appendChild(item.element);
        });

        if (!ul.lastChild) {
            return;
        }

        productDataContainer.appendChild(details);
    });
}

function isLotto(match: string | null, lotto: string): boolean {
    if (match === null) return true;

    return new RegExp(match, "i").test(lotto);
}

function isFormat(match: string | null, format: string) {
    if (match === null) return true;

    return new RegExp(match, "i").test(format);
}

function isStamp(match: string | null, stamp: string) {
    if (match === null) return true;

    return new RegExp(match, "i").test(stamp);
}

function isThickness(match: string | null, thickness: number) {
    if (match === null) return true;

    return new RegExp(match, "i").test(thickness.toString());
}
