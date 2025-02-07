import * as globals from "../globals";
import * as types from "../types";

const html = String.raw;

function init(entry?: types.SpecialFlakesEntry | null): types.Component<
    HTMLDialogElement,
    {
        close: HTMLButtonElement;
        inputs: HTMLElement;
        reset: HTMLInputElement;
    },
    { open: () => Promise<types.SpecialFlakesEntry | null> }
> {
    const root = document.querySelector<HTMLDialogElement>(`dialog[name="special-flakes-entry"]`)!;

    const query = {
        close: root.querySelector<HTMLButtonElement>(`button.close`)!,
        inputs: root.querySelector<HTMLElement>(`.inputs`)!,
        reset: root.querySelector<HTMLInputElement>(`input[type="reset"]`)!,
    };

    const open: () => Promise<types.SpecialFlakesEntry | null> = () => {
        return new Promise((resolve, _reject) => {
            let canceled = false;
            query.close.onclick = () => {
                canceled = true;
                root.close();
            };

            root.onclose = () => {
                if (canceled) {
                    resolve(null);
                    return;
                }

                // Get the values from the dialog form inputs
                const inputs = query.inputs.querySelectorAll(`input`);
                const select = query.inputs.querySelector<HTMLSelectElement>("select")!;

                const result: types.SpecialFlakesEntry = {
                    press:
                        entry?.press ||
                        (select.options[select.selectedIndex]
                            .value as types.SpecialFlakes_PressSlot),

                    compatatore: parseInt(inputs[0].value, 10),

                    primary: {
                        ...(entry?.primary || {}),
                        value: parseInt(inputs[1].value || "0", 10),
                        percent: 0,
                    },

                    secondary: [...query.inputs.querySelectorAll(`.tower-slot`)]
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
                query.inputs.innerHTML = html``;

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

                query.inputs.appendChild(firstRow);

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
                    query.inputs.appendChild(item);
                });
            };

            initForm();

            query.reset.onclick = (e) => {
                if (!entry) return;
                e.preventDefault();
                initForm();
            };

            root.showModal();
        });
    };

    return {
        element: root,
        query,
        utils: {
            open,
        },
        destroy() {},
    };
}

export default init;
