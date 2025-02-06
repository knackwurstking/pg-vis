import * as types from "../../../../types";

const html = String.raw;

export function table(data: types.SpecialFlakesEntry[]): types.Component<HTMLTableElement, {}> {
    const el = document.createElement("table");
    el.innerHTML = html`
        <thead>
            <tr></tr>
        </thead>

        <tbody></tbody>
    `;

    const trHead = el.querySelector(`thead.tr`);
    // TODO: Continue here

    const tbody = document.createElement("tbody");
    // TODO: Continue here

    return {
        element: el,
        destroy() {},
    };
}
