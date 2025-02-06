import * as types from "../../../../types";
import * as globals from "../../../../globals";

const html = String.raw;

export function table(
    name: string,
    entries: types.SpecialFlakesEntry[],
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
                ${globals.flakesTowerSlots.map((slot) => html`<th>${slot}</th>`).join("")}
            </tr>
        </thead>

        <tbody></tbody>
    `;

    const tbody = el.querySelector<HTMLElement>("tbody")!;

    entries
        .sort((a, b) => (a.primary.value > b.primary.value ? -1 : 1))
        .sort((a, b) => (a.primary.percent > b.primary.percent ? -1 : 1))
        .forEach((entry) => {
            const tr = document.createElement("tr");

            {
                let td = document.createElement("td");
                td.innerText = entry.compatatore.toString();
                tr.appendChild(td);

                td = document.createElement("td");
                td.innerHTML = html`
                    <span>${entry.primary.percent}%</span>
                    <br />
                    <span>${entry.primary.value}</span>
                `;
                tr.appendChild(td);

                globals.flakesTowerSlots.forEach((slot) => {
                    const td = document.createElement("td");
                    tr.appendChild(td);

                    const part = entry.secondary.find((e) => e.slot === slot);
                    if (!part) {
                        td.innerHTML = "-";
                        return;
                    }

                    td.innerHTML = html`
                        <span>${part.percent}%</span>
                        <br />
                        <span>${part.value}</span>
                    `;
                });
            }

            tbody.appendChild(tr);
        });

    return {
        element: el,
        destroy() {},
    };
}
