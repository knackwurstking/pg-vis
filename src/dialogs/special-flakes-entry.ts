import * as query from "../utils-query";
import * as types from "../types";
import * as globals from "../globals";

const html = String.raw;

function init(entry?: types.SpecialFlakesEntry | null): Promise<types.SpecialFlakesEntry | null> {
    return new Promise((resolve, _reject) => {
        const dialog = query.dialog_SpecialFlakesEntry();

        let canceled = false;
        dialog.close.onclick = () => {
            canceled = true;
            dialog.root.close();
        };

        dialog.root.onclose = () => {
            if (canceled) {
                resolve(null);
                return;
            }

            // Get the values from the dialog form inputs
            const inputs = dialog.inputs.querySelectorAll(`input`);
            const select = dialog.inputs.querySelector<HTMLSelectElement>("select")!;

            const result: types.SpecialFlakesEntry = {
                press:
                    entry?.press ||
                    (select.options[select.selectedIndex].value as types.SpecialFlakes_PressSlot),

                compatatore: parseInt(inputs[0].value, 10),

                primary: {
                    ...(entry?.primary || {}),
                    value: parseInt(inputs[1].value || "0", 10),
                    percent: 0,
                },

                secondary: [...dialog.inputs.querySelectorAll(`.tower-slot`)]
                    .map((el, index) => {
                        const [inputPercent, inputSpeed] = el.querySelectorAll("input");
                        const percent = parseInt(inputPercent.value, 10);
                        const speed = parseInt(inputSpeed.value, 10);
                        return {
                            percent,
                            value: speed,
                            slot: globals.flakesTowerSlots[index],
                        };
                    })
                    .filter((e) => !!e.value),
            };

            result.primary.percent = eval(
                "100 -" + result.secondary.map((e) => `${e.percent}`).join(" - "),
            );

            resolve(result);
        };

        const initForm = () => {
            dialog.inputs.innerHTML = html``;

            const firstRow = document.createElement("div");
            firstRow.className = "ui-flex-grid-row";
            firstRow.style.setProperty("--align", "center");
            firstRow.style.setProperty("--justify", "space-evenly");
            firstRow.innerHTML = html`
                <div class="ui-flex-grid ui-flex-grid-item" style="--gap: 0; --flex: 0;">
                    <label>Main</label>
                    <input
                        class="input"
                        id="specialFlakesEntry_Main"
                        style="width: 12ch; text-align: center;"
                        type="number"
                        value="${entry?.primary.value || ""}"
                    />
                </div>

                <div class="ui-flex-grid ui-flex-grid-item" style="--gap: 0; --flex: 0;">
                    <label>C1</label>
                    <input
                        class="input"
                        id="specialFlakesEntry_C1"
                        style="width: 6ch; text-align: center;"
                        type="number"
                        value="${entry?.compatatore || 25}"
                    />
                </div>

                <div class="ui-flex-grid ui-flex-grid-item" style="--gap: 0; --flex: 0;">
                    <label>&nbsp;</label>
                    <select>
                        <option value="P0">Presse 0</option>
                        <option value="P4">Presse 4</option>
                        <option value="P5">Presse 5</option>
                    </select>
                </div>
            `;

            firstRow.querySelector<HTMLSelectElement>(`select`)!.selectedIndex =
                globals.flakesPressSlots.indexOf(entry?.press || globals.flakesPressSlots[0]);

            dialog.inputs.appendChild(firstRow);

            globals.flakesTowerSlots.forEach((slot) => {
                const { percent, value } = entry?.secondary.find((e) => e.slot === slot) || {
                    percent: 0,
                    value: 0,
                };

                const item = document.createElement("div");
                item.className = "ui-flex-grid-item";
                item.innerHTML = html`
                    <div class="tower-slot ui-flex-grid-item">
                        <h5>${slot}</h5>

                        <div
                            class="ui-flex-grid-row"
                            style="--align: center; --justify: space-between"
                        >
                            <div class="ui-flex-grid" style="--gap: 0">
                                <label>Prozent</label>
                                <input
                                    class="input"
                                    id="specialFlakesEntry_${slot}-percent"
                                    style="text-align: center;"
                                    type="number"
                                    value="${percent || ""}"
                                />
                            </div>

                            <div class="ui-flex-grid" style="--gap: 0">
                                <label>Geschwindigkeit</label>
                                <input
                                    class="input"
                                    id="specialFlakesEntry_${slot}-speed"
                                    style="text-align: center;"
                                    type="number"
                                    value="${value || ""}"
                                />
                            </div>
                        </div>
                    </div>
                `;
                dialog.inputs.appendChild(item);
            });
        };

        initForm();

        dialog.reset.onclick = (e) => {
            if (!entry) return;
            e.preventDefault();
            initForm();
        };

        dialog.root.showModal();
    });
}

export default init;
