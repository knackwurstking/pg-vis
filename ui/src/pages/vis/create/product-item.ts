import * as types from "../../../types";

const html = String.raw;

export interface ProductItemProps {
    product: types.Product;
    enableRouting?: {
        dataIndex: number;
    };
}

export function productItem(
    props: ProductItemProps,
): types.Component<HTMLLIElement> {
    const el = document.createElement("li");

    el.className =
        "product-item ui-flex nowrap align-center justify-between ui-border-bottom ui-padding";

    el.style.width = "100%";

    if (!!props.enableRouting) {
        el.role = "button";
        el.style.cursor = "pointer";

        el.setAttribute(
            "data-index",
            props.enableRouting!.dataIndex.toString(),
        );
    }

    props.product.lotto;
    props.product.name;
    el.innerHTML = html`
        <div class="ui-flex column gap" style="--mono: 1; width: 100%;">
            <div class="ui-flex wrap justify-between" style="gap: 1rem;">
                <div
                    class="lotto"
                    style="--wght: 700; color: var(--ui-primary);"
                >
                    ${props.product.lotto}
                </div>
                <div class="name" style="--wght: 350; --slnt: -4;">
                    ${props.product.name}
                </div>
            </div>

            <div class="ui-flex wrap justify-between" style="gap: 1rem;">
                <div
                    class="ui-flex gap justify-start"
                    style="width: fit-content"
                >
                    <div class="format">${props.product.format}</div>
                    <div class="thickness">${props.product.thickness}mm</div>
                </div>

                <div
                    class="stamp ui-flex-item ui-flex justify-end"
                    style="text-wrap: nowrap;"
                >
                    ${props.product.stamp}
                </div>
            </div>
        </div>
    `;

    return {
        element: el,
        destroy() {},
    };
}
