import { Octokit } from "octokit";
import PGApp from "../app/pg-app";
import { ListsStoreData, newListsStore } from "./lists-store";
import { AlertList, MetalSheet } from "../store-types";

export async function importFromGist(
    storeKey: keyof ListsStoreData,
    gistID: string,
) {
    try {
        const resp = await gist(gistID);
        const listsStore = newListsStore(storeKey);
        const newData: (AlertList | MetalSheet)[] = [];

        for (const file of Object.values(resp.data.files || {})) {
            if (!file?.content) continue;

            const content = JSON.parse(file.content);
            const data = listsStore.validate(content);
            if (data === null) {
                console.error(
                    `Invalid data for "${listsStore.title()}":`,
                    content,
                );
                throw new Error(`ungültige Daten für "${listsStore.title()}"!`);
            }

            newData.push(data);
        }

        const revision = await gistRevision(gistID);

        const store = PGApp.queryStore();
        store.setData(storeKey, []); // Clear data first

        listsStore.addToStore(store, newData, true);
        store.updateData("gist", (data) => {
            data[`${storeKey}`] = {
                id: gistID,
                revision: revision,
            };

            return data;
        });
    } catch (err) {
        // Something went wrong: ${err}
        alert(`Etwas ist schiefgelaufen: ${err}`);
        return;
    }
}

export async function gist(gistID: string) {
    const octokit = new Octokit();
    const resp = await octokit.request("GET /gists/{gist_id}", {
        gist_id: gistID,
        headers: {
            "X-GitHub-Api-Version": "2022-11-28",
        },
    });

    if (resp.status !== 200) {
        console.error(resp);
        throw new Error(
            `anfrage von "GET /gist/${gistID}" ist mit Statuscode ${resp.status} fehlgeschlagen`,
        );
    }

    return resp;
}

export async function gistRevision(gistID: string): Promise<number> {
    const octokit = new Octokit();
    const resp = await octokit.request("GET /gists/{gist_id}/commits", {
        gist_id: gistID,
        headers: {
            "X-GitHub-Api-Version": "2022-11-28",
        },
    });

    if (resp.status !== 200) {
        console.error(resp);
        return -1;
    }

    return resp.data.length;
}
