import * as types from "../../../../types";
import * as globals from "../../../../globals";

const html = String.raw;

export function table(
    name: string,
    data: types.SpecialFlakesEntry[],
): types.Component<HTMLTableElement, {}> {
    const el = document.createElement("table");

    el.style.width = "100%";

    el.innerHTML = html`
        <thead>
            <tr>
                <th class="left" colspan="100%">${name}</th>
            </tr>
            <tr>
                <th>C1</th>
                <th>Main</th>
                ${globals.flakesPressSlots.map((slot) => html`<th>${slot}</th>`).join("")}
            </tr>
        </thead>

        <tbody></tbody>
    `;

    const tbody = document.createElement("tbody");
    // TODO: Continue here

    return {
        element: el,
        destroy() {},
    };
}
