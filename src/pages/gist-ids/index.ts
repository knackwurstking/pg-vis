import * as query from "../../utils-query";

let originTitle: string = "";

export async function onMount() {
    const appBarTitle = query.appBar_Title();
    originTitle = appBarTitle.innerText;
    appBarTitle.innerText = "Gist IDs";

    gistIDInputs();
    autoUpdatesCheckboxes();
}

export async function onDestroy() {
    query.appBar_Title().innerText = originTitle;
}

function gistIDInputs() {
    const inputElements = document.querySelectorAll<HTMLInputElement>(
        `.gist-ids .gist-id-container input[type="text"]`,
    );

    for (const el of inputElements) {
        switch (el.id) {
            case "gistID_AlertLists":
                // TODO: ...
                break;

            case "gistID_MetalSheets":
                // TODO: ...
                break;

            case "gistID_VIS":
                // TODO: ...
                break;

            case "gistID_VISData":
                // TODO: ...
                break;

            case "gistID_Special":
                // TODO: ...
                break;

            default:
                throw new Error(`unknown id "${el.id}"`);
        }
    }
}

function autoUpdatesCheckboxes() {
    // TODO: ...
}
