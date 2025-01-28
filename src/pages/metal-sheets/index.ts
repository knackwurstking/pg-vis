import * as ui from "ui";

import * as globals from "../../globals";
import * as query from "../../utils-query";

let cleanup: (() => void)[] = [];
let originTitle: string = "";

export async function onMount() {
    const param = ui.router.hash.getSearchParam();
    const list = globals.getMetalSheet(param.listKey);
    if (!list) {
        throw new Error(`alert list not found: listKey=${param.listKey}`);
    }

    const appBarTitle = query.appBar_Title();
    originTitle = appBarTitle.innerText;
    appBarTitle.innerText =
        list.data.press > -1
            ? `[P${list.data.press}] ${list.format} ${list.toolID}`
            : `${list.format} ${list.toolID}`;

    // TODO: Add some action buttons for adding a new table entry

    // Enable app bar button for editing the current sheet
    const listEditButton = query.appBar_ButtonListEdit();
    listEditButton.onclick = () => {
        // Open the edit metal sheet dialog for changing "format", "toolID" and filters
        const dialog = query.dialog_MetalSheet();

        let canceled = false;
        dialog.close.onclick = () => {
            canceled = true;
            dialog.root.close();
        };

        dialog.root.onclose = () => {
            if (canceled) {
                return;
            }

            // TODO: Read form inputs, check data, update or reopen this dialog
            console.debug("Submit...");
            dialog.filters.forEach((filter) => {
                // ...
            });
        };

        // TODO: Set list data to the dialog

        dialog.root.showModal();
    };
    listEditButton.style.display = "inline-flex";
    cleanup.push(() => (listEditButton.onclick = null));

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
