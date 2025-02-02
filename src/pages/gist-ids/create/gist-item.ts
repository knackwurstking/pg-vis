import * as gist from "../../../gist";
import * as globals from "../../../globals";
import * as types from "../../../types";

const html = String.raw;

export interface GistItemProps {
    title: string;
    storeKey: types.DrawerGroups;
}

export function gistItem(props: GistItemProps): types.Component<HTMLLIElement> {
    const el = document.createElement("li");

    el.className = "gist-item ui-flex-grid-item ui-border";
    el.style.width = "100%";

    el.innerHTML = html`
        <div class="ui-flex-grid-row" style="--justify: space-between; --align: center;">
            <h3>${props.title}</h3>
            <div
                class="ui-flex-grid"
                style="--align: flex-end; --gap: 0; --mono: 1; font-size: 0.85rem; width: fit-content;"
            >
                <span>
                    <span>Remote Rev.: </span>
                    <span id="gistID_RemoteRevision_${props.storeKey}">?</span>
                </span>

                <span>
                    <span>Local Rev.: </span>
                    <span
                        id="gistID_LocalRevision_${props.storeKey}"
                        style="--wght: 450; color: green"
                    >
                        ${globals.store.get(props.storeKey)!.gist?.revision || "?"}
                    </span>
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
            class="dev-mode ui-flex-grid-row"
            style="--align: flex-end; --justify: space-between; width: 100%"
        >
            <div class="ui-flex-grid-item">
                <label for="apiToken_${props.storeKey}">API Token</label>
                <input
                    id="apiToken_${props.storeKey}"
                    style="width: 100%"
                    type="text"
                    placeholder="API Token hier einfügen"
                    value="${globals.store.get(props.storeKey)!.gist?.token || ""}"
                />
            </div>
            <div class="ui-flex-grid-item" style="--flex: 0;">
                <button class="push" variant="ghost" color="primary" icon>
                    <i class="bi bi-cloud-upload"></i>
                </button>
            </div>

            <!-- TODO: Add a force push checkbox for reset repo back to revision 1 -->
        </div>
    `;

    const localRevSpan = el.querySelector<HTMLSpanElement>(
        `#gistID_LocalRevision_${props.storeKey}`,
    )!;
    const remoteRevSpan = el.querySelector<HTMLSpanElement>(
        `#gistID_RemoteRevision_${props.storeKey}`,
    )!;
    const inputGistID = el.querySelector<HTMLInputElement>(`#gistID_${props.storeKey}`)!;
    const updateButton = el.querySelector<HTMLButtonElement>(`button.update`)!;

    inputGistID.onchange = async () => updateButton.click();

    let updateInProgress: boolean = false;
    updateButton.onclick = async () => {
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
            data.gist = { id: gistID, revision: null };
            return data;
        });

        try {
            const data = await gist.pull(props.storeKey, gistID);
            globals.store.set(props.storeKey, data);
            remoteRevSpan.innerText = localRevSpan.innerText = `${data.gist?.revision || "?"}`;
            localRevSpan.style.color = "green";
            inputGistID.ariaInvalid = null;
        } catch (err) {
            const message = `Pull from gist failed for "${props.storeKey}" ("${gistID}"): ${err}`;
            console.error(message);
            alert(message);
            inputGistID.ariaInvalid = "";
        }

        return cleanUp();
    };

    if (!!inputGistID.value) {
        setTimeout(async () => {
            try {
                let remoteRev =
                    globals.store.get("runtime")!.lists[inputGistID.value]?.remoteRevision || null;
                if (!remoteRev) {
                    remoteRev = await gist.getRevision(inputGistID.value);
                    globals.store.update("runtime", (data) => {
                        data.lists[inputGistID.value] = {
                            remoteRevision: remoteRev,
                        };
                        return data;
                    });
                }

                remoteRevSpan.innerText = `${remoteRev || "?"}`;
                inputGistID.ariaInvalid = null;

                if (
                    gist.shouldUpdate(
                        remoteRev,
                        globals.store.get(props.storeKey)!.gist?.revision || null,
                    )
                ) {
                    localRevSpan.style.color = "red";
                } else {
                    localRevSpan.style.color = "green";
                }
            } catch (err) {
                inputGistID.ariaInvalid = "";
                console.debug(
                    `Update failed for "${props.storeKey}" ("${inputGistID.value}"): ${err}`,
                );
            }
        });
    }

    // Dev Mode handler
    const inputAPIToken = el.querySelector<HTMLInputElement>(`#gistID_${props.storeKey}`)!;
    const pushButton = el.querySelector<HTMLInputElement>(`button.push`)!;

    let pushInProgress = false;
    pushButton.onclick = async () => {
        if (!inputAPIToken.value) {
            return;
        }

        if (pushInProgress) {
            return;
        }

        pushInProgress = true;
        pushButton.classList.add("active");
        const cleanUp = () => {
            setTimeout(() => {
                pushInProgress = false;
                pushButton.classList.remove("active");
            });
        };

        const gistID = inputGistID.value;
        const apiToken = inputAPIToken.value;

        try {
            await gist.push(props.storeKey, apiToken, gistID);
            // TODO: Update local and remote gist id
        } catch (err) {
            const message = `Push to gist failed for "${props.storeKey}" ("${gistID}"): ${err}`;
            console.error(message);
            alert(message);
        }

        return cleanUp();
    };

    return {
        element: el,
        destroy() {},
    };
}
