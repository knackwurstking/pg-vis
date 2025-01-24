import * as ui from "ui";
import * as types from "../../../types";

const html = String.raw;

export interface AlertItemProps {
    enableRouting?: boolean;
}

export function alertItem(
    alert: types.Alert,
    props?: AlertItemProps | null,
): types.Component<HTMLLIElement> {
    const el = document.createElement("li");

    el.className = "alert-item ui-flex nowrap align-center justify-between";

    el.style.width = "100%";
    el.style.padding = "var(--ui-spacing)";
    el.style.borderBottom = "1px solid hsl(var(--ui-border-color)";

    if (!!props?.enableRouting) {
        el.role = "button";
        el.style.cursor = "pointer";

        // TODO: Go to alert detail page "?listKey=...&index=...#alert"
    }

    el.innerHTML = html`
        <p>${alert.alert}</p>
        <p
            style="${ui.styles({
                color: "var(--ui-primary)",
                textWrap: "nowrap",
                marginLeft: "var(--ui-spacing)",
            } as CSSStyleDeclaration)}"
        >
            ${alert.from === alert.to ? alert.from : `${alert.from}..${alert.to}`}
        </p>
    `;

    return {
        element: el,
        destroy() {},
    };
}
