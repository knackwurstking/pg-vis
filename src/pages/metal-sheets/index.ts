import * as ui from "ui";

import * as globals from "../../globals";
import * as query from "../../utils-query";
import * as dialogs from "../../dialogs";
import * as listStores from "../../list-stores";
import * as types from "../../types";

const tableHeader = [
    "Stärke",
    "Marke (Höhe)",
    "Blech Stempel",
    "Blech Marke",
    "Stf. P2 - P5",
    "Stf. P0",
];

let cleanup: (() => void)[] = [];
let originTitle: string = "";

export async function onMount() {
    const param = ui.router.hash.getSearchParam();
    const list = globals.getMetalSheet(param.listKey);
    if (!list) {
        throw new Error(`metal sheet not found: listKey=${param.listKey}`);
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
            const data = await dialogs.metalSheet(list);
            const formatInput = query.dialog_MetalSheet().format;

            if (!data) {
                formatInput.ariaInvalid = null;
                return;
            }

            if (!data.format) {
                listEditButton.click();
                formatInput.ariaInvalid = "";
                return;
            }

            formatInput.ariaInvalid = null;

            try {
                const ls = listStores.get("metal-sheets");
                ls.replaceInStore(data, list);
                reload();
            } catch (err) {
                alert(err);
                listEditButton.click();
                return;
            }
        };
        listEditButton.style.display = "inline-flex";
        cleanup.push(() => {
            listEditButton.style.display = "none";
            listEditButton.onclick = null;
        });
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
            ls.replaceInStore(list);
            reload();
        };
        addButton.style.display = "inline-flex";
        cleanup.push(() => {
            addButton.style.display = "none";
            addButton.onclick = null;
        });
    }

    list.data.table.data = sortTableData(list.data.table.data);
    render(list);
}

export async function onDestroy() {
    cleanup.forEach((fn) => fn());
    cleanup = [];
    query.appBar_Title().innerText = originTitle;
}

function render(list: types.MetalSheet) {
    const table = query.routerTarget().querySelector("table")!;
    const thead = table.querySelector(`thead`)!;
    const tbody = table.querySelector(`tbody`)!;

    thead.innerHTML = "";
    tbody.innerHTML = "";

    const tr = document.createElement("tr");
    thead.appendChild(tr);
    tableHeader.forEach((head, index) => {
        if (!!list.data.table.filter?.includes(index)) {
            return;
        }

        const el = document.createElement("th");
        el.style.textWrap = "pretty";
        el.innerText = head;
        tr.appendChild(el);
    });

    list.data.table.data.forEach((row) => {
        const tr = document.createElement("tr");
        tbody.appendChild(tr);

        tr.style.cursor = "pointer";
        tr.role = "button";

        tr.oncontextmenu = (e) => {
            e.preventDefault();

            if (confirm(`You want to delete this item: "${row.join(",")}" ?`)) {
                const rowJoin = row.join(",");
                list.data.table.data = list.data.table.data.filter((r) => r.join(",") !== rowJoin);

                const ls = listStores.get("metal-sheets");
                ls.replaceInStore(list);
                reload();
            }
        };

        tr.onclick = async () => {
            const data = await dialogs.metalSheetTableEntry(row);
            if (!data) {
                return;
            }

            // Update data and re-render table
            const rowJoin = row.join(",");
            list.data.table.data = list.data.table.data.map((r) => {
                if (r.join(",") === rowJoin) {
                    return data;
                }

                return r;
            });

            const ls = listStores.get("metal-sheets");
            ls.replaceInStore(list);
            reload();
        };

        row.forEach((cell, index) => {
            if (!!list.data.table.filter?.includes(index)) {
                return;
            }

            const el = document.createElement("td");
            el.innerText = cell;
            tr.appendChild(el);
        });
    });
}

async function reload() {
    await onDestroy();
    await onMount();
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
