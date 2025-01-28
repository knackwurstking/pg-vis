import * as ui from "ui";

import * as globals from "../../globals";
import * as query from "../../utils-query";
import * as dialogs from "../../dialogs";
import * as listStores from "../../list-stores";

let cleanup: (() => void)[] = [];
let originTitle: string = "";

export async function onMount() {
    const param = ui.router.hash.getSearchParam();
    const list = globals.getMetalSheet(param.listKey);
    if (!list) {
        throw new Error(`alert list not found: listKey=${param.listKey}`);
    }

    // Set the app bar title
    {
        const appBarTitle = query.appBar_Title();
        originTitle = appBarTitle.innerText;
        appBarTitle.innerText =
            list.data.press > -1
                ? `[P${list.data.press}] ${list.format} ${list.toolID}`
                : `${list.format} ${list.toolID}`;
    }

    // Enable app bar button for editing the current sheet
    {
        // Enable app bar button for editing the current sheet
        const listEditButton = query.appBar_ButtonListEdit();
        listEditButton.onclick = async () => {
            const formatInput = query.dialog_MetalSheet().format;
            const data = await dialogs.metalSheet(list);

            if (!data) {
                formatInput.ariaInvalid = null;
                return;
            }

            if (!data.format) {
                listEditButton.click();
                formatInput.ariaInvalid = "";
                return;
            } else {
                formatInput.ariaInvalid = null;
            }

            const ls = listStores.get("metal-sheets");
            ls.replaceInStore(data, list);
        };
        listEditButton.style.display = "inline-flex";
        cleanup.push(() => (listEditButton.onclick = null));
    }

    // Enable app bar button for adding a new table entry
    {
        const addButton = query.appBar_ButtonAdd();
        addButton.onclick = async () => {
            const data = await dialogs.metalSheetTableEntry();
            if (!data) {
                return;
            }
            list.data.table.data.push(data);

            const ls = listStores.get("metal-sheets");
            ls.addToStore([list]);
        };
        addButton.style.display = "inline-flex";
        cleanup.push(() => (addButton.onclick = null));
    }

    render(list.data.table.header, sortTableData(list.data.table.data), param.listKey);
}

export async function onDestroy() {
    cleanup.forEach((fn) => fn());
    cleanup = [];
    query.appBar_Title().innerText = originTitle;
}

function render(header: string[], data: string[][], _listKey: string) {
    const table = query.routerTarget().querySelector("table")!;
    const thead = table.querySelector(`thead`)!;
    const tbody = table.querySelector(`tbody`)!;

    const tr = document.createElement("tr");
    thead.appendChild(tr);
    header.forEach((head) => {
        const el = document.createElement("th");
        el.style.textWrap = "pretty";
        el.innerText = head;
        tr.appendChild(el);
    });

    data.forEach((row) => {
        const tr = document.createElement("tr");
        tbody.appendChild(tr);
        row.forEach((cell) => {
            const el = document.createElement("td");
            el.innerText = cell;
            tr.appendChild(el);
        });
    });
}

function sortTableData(data: string[][]): string[][] {
    data.sort((a, b) => {
        const thicknessA = parseFloat(a[0]);
        const thicknessB = parseFloat(b[0]);

        if (thicknessA > thicknessB) {
            // Compare thickness
            return 1;
        } else if (thicknessA === thicknessB && parseFloat(a[1]) > parseFloat(b[1])) {
            // Compare height if thickness is event
            return 1;
        }

        return -1;
    });

    return data;
}
