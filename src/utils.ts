import FileSaver from "file-saver";
import JSZip from "jszip";

import * as types from "./types";
import * as query from "./utils-query";
import * as globals from "./globals";
import * as listStores from "./list-stores";

export function setAppBarTitle(title: string): types.CleanUp {
    const titleElement = query.appBar_Title();

    let originalTitle = titleElement.innerText;

    titleElement.innerText = title;

    return () => {
        titleElement.innerText = originalTitle;
    };
}

export function generateRegExp(value: string): RegExp {
    const regexSplit: string[] = value.split(" ").filter((v) => v !== "");
    try {
        return new RegExp("(?=.*" + regexSplit.join(")(?=.*") + ")", "i");
    } catch {
        return new RegExp(
            "(?=.*" +
                regexSplit
                    .map((part) => part.replace(/[()]/g, "\\$&")) // $& means the whole matched string
                    .join(")(?=.*") +
                ")",
            "i",
        );
    }
}

export async function downloadZIP(storeKey: types.DrawerGroups) {
    const zip = new JSZip();
    const listsStore = listStores.get(storeKey);

    const storeData = globals.store.get(storeKey);
    if (storeData === undefined) return;

    for (const list of storeData.lists) {
        const fileName = listsStore.fileName(list);
        zip.file(fileName, JSON.stringify(list, null, 4));
    }

    FileSaver.saveAs(await zip.generateAsync({ type: "blob" }), listsStore.zipFileName());
}

export async function importFromFile(fileType: ".txt" | ".json", storeKey: types.DrawerGroups) {
    const input = document.createElement("input");

    input.type = "file";
    input.accept = fileType;
    input.multiple = true;

    input.onchange = () => {
        if (!input.files) {
            return;
        }

        for (const file of input.files) {
            const reader = new FileReader();

            reader.onload = async () => {
                if (typeof reader.result !== "string") {
                    return;
                }

                const ls = listStores.get(storeKey);
                let data: any;

                try {
                    data = ls.validate(reader.result);
                } catch (err) {
                    alert(err);
                    return;
                }

                if (data === null) {
                    alert(`Ungültige Daten für "${ls.title()}"!`);
                    return;
                }

                try {
                    ls.addToStore([data]);
                } catch (err) {
                    alert(err);
                    return;
                }
            };

            reader.onerror = () => {
                alert(`Lesen der Datei "${file.name}" ist fehlgeschlagen!`);
            };

            reader.readAsText(file);
        }
    };

    input.click();
}
