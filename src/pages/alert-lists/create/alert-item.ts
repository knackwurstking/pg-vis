import * as ui from "ui";
import * as types from "../../../types";

const html = String.raw;

export interface AlertItemProps {
    alert: types.Alert;
    alertIndex?: number;
    listKey?: string;
    enableRouting?: boolean;
}

export function alertItem(props: AlertItemProps): types.Component<HTMLLIElement> {
    const el = document.createElement("li");

    el.className = "alert-item ui-flex nowrap align-center justify-between";

    el.style.width = "100%";
    el.style.padding = "var(--ui-spacing)";
    el.style.borderBottom = "1px solid var(--ui-border-color)";

    if (!!props.enableRouting) {
        el.role = "button";
        el.style.cursor = "pointer";

        location.href = `?listKey=${props.listKey}&index=${props.alertIndex}#alert`;
    }

    el.innerHTML = html`
        <p>${props.alert.alert}</p>
        <p
            style="${ui.styles({
                color: "var(--ui-primary)",
                textWrap: "nowrap",
                marginLeft: "var(--ui-spacing)",
            } as CSSStyleDeclaration)}"
        >
            ${props.alert.from === props.alert.to
                ? props.alert.from
                : `${props.alert.from}..${props.alert.to}`}
        </p>
    `;

    return {
        element: el,
        destroy() {},
    };
}
