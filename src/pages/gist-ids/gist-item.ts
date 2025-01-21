import * as globals from "../../globals";
import * as types from "../../types";

const html = String.raw;

export interface Props {
    title: string;
    storeKey: types.DrawerGroups;
}

export function create(props: Props): HTMLLIElement {
    const el = document.createElement("li");
    el.className = "ui-flex-grid-item ui-border";
    el.style.width = "100%";
    el.innerHTML = html`
        <h3>${props.title}</h3>

        <!-- TODO: ...
            * Display current revision number
            * Check for updates
            * Update button
        -->

        <div class="gist-id-container ui-flex-grid-item" style="width: 100%;">
            <label for="gistID_${props.storeKey}">Gist ID</label>
            <input
                id="gistID_${props.storeKey}"
                style="width: 100%"
                type="text"
                placeholder="Gist ID von Telegram hier einfügen"
            />
        </div>

        <div
            class="auto-update-container ui-flex-grid-row"
            style="--justify: space-between; --align: center;"
        >
            <label
                style="width: 100%; padding: var(--ui-spacing);"
                for="autoUpdate_${props.storeKey}"
            >
                Auto Update
            </label>
            <input
                id="autoUpdate_${props.storeKey}"
                style="margin-right: var(--ui-spacing);"
                type="checkbox"
            />
        </div>
    `;

    const inputGistID = el.querySelector<HTMLInputElement>(`#gistID_${props.storeKey}`)!;
    const checkboxAutoUpdate = el.querySelector<HTMLInputElement>(`#autoUpdate_${props.storeKey}`)!;

    inputGistID.onchange = async () => {
        if (!inputGistID.value) {
            globals.store.update(props.storeKey, (data) => {
                data.gist = null;
                return data;
            });
            return;
        }

        globals.store.update(props.storeKey, (data) => {
            data.gist = {
                id: inputGistID.value,
                revision: -1,
            };
            return data;
        });

        // TODO: Import from gist here...
    };

    checkboxAutoUpdate.onchange = async () => {
        // TODO: ...
    };

    return el;
}
