import { Octokit } from "octokit";

import * as globals from "./globals";
import * as types from "./types";
import * as listStores from "./list-stores";

export async function pull(storeKey: keyof listStores.ListStoreData, gistID: string) {
    try {
        const resp = await getGist(gistID);
        const listsStore = listStores.get(storeKey);
        const newLists: (types.AlertList | types.MetalSheet | types.Vis)[] = [];

        for (const file of Object.values(resp.data.files || {})) {
            if (!file?.content) continue;

            const data = listsStore.validate(file.content);
            if (data === null) {
                console.error(`Invalid data for "${listsStore.title()}":`, file.content);
                throw new Error(`ungültige Daten für "${listsStore.title()}"!`);
            }

            newLists.push(data);
        }

        const revision = await gistRevision(gistID);

        globals.store.set(storeKey, {
            gist: {
                id: gistID,
                revision: revision,
            },
            lists: [],
        }); // Clear data first

        listsStore.addToStore(newLists);
    } catch (err) {
        alert(`Etwas ist schiefgelaufen: ${err}`);
    }
}

async function getGist(gistID: string) {
    const octokit = new Octokit();
    const resp = await octokit.request("GET /gists/{gist_id}", {
        gist_id: gistID,
        headers: {
            "X-GitHub-Api-Version": "2022-11-28",
        },
    });

    if (resp.status !== 200) {
        throw new Error(
            `anfrage von "GET /gist/${gistID}" ist mit Statuscode ${resp.status} fehlgeschlagen`,
        );
    }

    return resp;
}

async function gistRevision(gistID: string): Promise<number> {
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
