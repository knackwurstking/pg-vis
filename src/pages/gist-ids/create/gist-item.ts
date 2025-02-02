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
            style="--align: flex-end; --justify: space-between; width: 100%; display: none"
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

    const inputAPIToken = el.querySelector<HTMLInputElement>(`#apiToken_${props.storeKey}`)!;
    const pushButton = el.querySelector<HTMLButtonElement>(`button.push`)!;

    initNormalMode(
        props.storeKey,
        localRevSpan,
        remoteRevSpan,
        inputGistID,
        inputAPIToken,
        updateButton,
    );

    initDevMode(
        props.storeKey,
        localRevSpan,
        remoteRevSpan,
        inputGistID,
        inputAPIToken,
        pushButton,
    );

    return {
        element: el,
        destroy() {},
    };
}

async function initNormalMode(
    storeKey: types.DrawerGroups,
    localRevSpan: HTMLSpanElement,
    remoteRevSpan: HTMLSpanElement,
    inputPull: HTMLInputElement,
    inputPush: HTMLInputElement,
    button: HTMLButtonElement,
) {
    inputPull.onchange = async () => button.click();

    let inProgress: boolean = false;
    button.onclick = async () => {
        if (inProgress) {
            return;
        }

        inProgress = true;
        button.classList.add("active");
        const cleanUp = () => {
            setTimeout(() => {
                inProgress = false;
                button.classList.remove("active");
            });
        };

        const gistID = inputPull.value;

        if (!gistID) {
            globals.store.update(storeKey, (data) => {
                data.gist = null;
                return data;
            });

            return cleanUp();
        }

        globals.store.update(storeKey, (data) => {
            data.gist = {
                id: gistID,
                revision: null,
                token: inputPush.value,
            };
            return data;
        });

        try {
            const data = await gist.pull(storeKey, gistID);
            globals.store.set(storeKey, data);
            remoteRevSpan.innerText = localRevSpan.innerText = `${data.gist?.revision || "?"}`;
            localRevSpan.style.color = "green";
            inputPull.ariaInvalid = null;
        } catch (err) {
            const message = `Pull from gist failed for "${storeKey}" ("${gistID}"): ${err}`;
            console.error(message);
            alert(message);
            inputPull.ariaInvalid = "";
        }

        return cleanUp();
    };

    if (!!inputPull.value) {
        setTimeout(async () => {
            try {
                let remoteRev =
                    globals.store.get("runtime")!.lists[inputPull.value]?.remoteRevision || null;
                if (!remoteRev) {
                    remoteRev = await gist.getRevision(inputPull.value);
                    globals.store.update("runtime", (data) => {
                        data.lists[inputPull.value] = {
                            remoteRevision: remoteRev,
                        };
                        return data;
                    });
                }

                remoteRevSpan.innerText = `${remoteRev || "?"}`;
                inputPull.ariaInvalid = null;

                if (
                    gist.shouldUpdate(
                        remoteRev,
                        globals.store.get(storeKey)!.gist?.revision || null,
                    )
                ) {
                    localRevSpan.style.color = "red";
                } else {
                    localRevSpan.style.color = "green";
                }
            } catch (err) {
                inputPull.ariaInvalid = "";
                console.debug(`Update failed for "${storeKey}" ("${inputPull.value}"): ${err}`);
            }
        });
    }
}

async function initDevMode(
    storeKey: types.DrawerGroups,
    localRevSpan: HTMLSpanElement,
    remoteRevSpan: HTMLSpanElement,
    inputPull: HTMLInputElement,
    inputPush: HTMLInputElement,
    button: HTMLButtonElement,
) {
    inputPush.oninput = () => {
        if (!!inputPush.value) {
            button.removeAttribute("disabled");
        } else {
            button.setAttribute("disabled", "");
        }

        globals.store.update(storeKey, (data) => {
            if (!data.gist) {
                data.gist = {
                    id: "",
                    revision: null,
                    token: inputPush.value,
                };
            } else {
                data.gist.token = inputPush.value;
            }

            return data;
        });
    };
    inputPush.oninput(new Event("input"));

    let pushInProgress = false;
    button.onclick = async () => {
        if (!inputPush.value) {
            return;
        }

        if (pushInProgress) {
            return;
        }

        pushInProgress = true;
        button.classList.add("active");
        const cleanUp = () => {
            setTimeout(() => {
                pushInProgress = false;
                button.classList.remove("active");
            });
        };

        const gistID = inputPull.value;
        const apiToken = inputPush.value;

        try {
            const data = await gist.push(storeKey, apiToken, gistID);
            globals.store.set(storeKey, data);
            remoteRevSpan.innerText = localRevSpan.innerText = `${data.gist?.revision || "?"}`;
            localRevSpan.style.color = "green";
        } catch (err) {
            const message = `Push to gist failed for "${storeKey}" ("${gistID}"): ${err}`;
            console.error(message);
            alert(message);
        }

        return cleanUp();
    };
}
