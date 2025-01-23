import * as gist from "../../gist";
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
        <div class="ui-flex-grid-row" style="--justify: space-between; --align: center;">
            <h3>${props.title}</h3>
            <div
                class="ui-flex-grid"
                style="--align: flex-end; --gap: 0; --mono: 1; font-size: 0.85rem; width: fit-content;"
            >
                <span>
                    <span>Local Rev.: </span>
                    <span id="gistID_LocalRevision_${props.storeKey}">
                        ${globals.store.get(props.storeKey)!.gist?.revision || "?"}
                    </span>
                </span>
                <span>
                    <span>Remote Rev.: </span>
                    <span id="gistID_RemoteRevision_${props.storeKey}">?</span>
                </span>
            </div>
        </div>

        <div
            class="gist-id-container ui-flex-grid-row"
            style="--align: flex-end; --justify: space-between; width: 100%;"
        >
            <div class="ui-flex-grid-item">
                <label for="gistID_${props.storeKey}">Gist ID</label>
                <input
                    id="gistID_${props.storeKey}"
                    style="width: 100%"
                    type="text"
                    placeholder="Gist ID von Telegram hier einfügen"
                    value="${globals.store.get(props.storeKey)!.gist?.id || ""}"
                />
            </div>
            <div class="ui-flex-grid-item" style="--flex: 0;">
                <button class="update" variant="ghost" color="primary" icon>
                    <i class="bi bi-cloud-download"></i>
                </button>
            </div>
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

    const localRevision = el.querySelector<HTMLSpanElement>(
        `#gistID_LocalRevision_${props.storeKey}`,
    )!;
    const remoteRevision = el.querySelector<HTMLSpanElement>(
        `#gistID_RemoteRevision_${props.storeKey}`,
    )!;
    const inputGistID = el.querySelector<HTMLInputElement>(`#gistID_${props.storeKey}`)!;
    const updateButton = el.querySelector<HTMLButtonElement>(`button.update`)!;
    const checkboxAutoUpdate = el.querySelector<HTMLInputElement>(`#autoUpdate_${props.storeKey}`)!;

    let updateInProgress: boolean = false;
    const onGistIDChange = async () => {
        if (updateInProgress) {
            return;
        }

        updateInProgress = true;
        updateButton.classList.add("active");
        const cleanUp = () => {
            setTimeout(() => {
                updateInProgress = false;
                updateButton.classList.remove("active");
            });
        };

        const gistID = inputGistID.value;

        if (!gistID) {
            globals.store.update(props.storeKey, (data) => {
                data.gist = null;
                return data;
            });

            return cleanUp();
        }

        globals.store.update(props.storeKey, (data) => {
            data.gist = {
                id: gistID,
                revision: null,
                autoUpdate: checkboxAutoUpdate.checked,
            };
            return data;
        });

        try {
            const data = await gist.pull(props.storeKey, gistID);
            globals.store.set(props.storeKey, data);
            localRevision.innerText = `${data.gist?.revision || "?"}`;
        } catch (err) {
            alert(`Etwas ist schiefgelaufen: ${err}`);
        }

        return cleanUp();
    };

    inputGistID.onchange = async () => updateButton.click();
    updateButton.onclick = async () => onGistIDChange();

    checkboxAutoUpdate.checked = globals.store.get(props.storeKey)!.gist?.autoUpdate || false;
    checkboxAutoUpdate.onchange = async () => {
        // TODO: if true: check revision and update if needed, also add some handler which is
        // running each time the app is starting or gaining focus again, show a confirmation dialog
        // before updating
    };

    if (!!inputGistID.value) {
        setTimeout(async () => {
            remoteRevision.innerText = `${(await gist.getRevision(inputGistID.value)) || "?"}`;
        });
    }

    return el;
}
