import * as types from "../../../types";

const html = String.raw;

export function alertItem(alert: types.Alert): types.Component<HTMLLIElement> {
    const el = document.createElement("li");

    el.className = "alert-item";
    el.style.width = "100%";

    el.innerHTML = html` <!-- TODO: ... --> `;

    return {
        element: el,
        destroy() {},
    };
}
