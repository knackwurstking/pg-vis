import * as query from "../../utils-query";
import * as create from "./create";

let cleanup: (() => void)[] = [];
let originTitle: string = "";

export async function onMount() {
    const appBarTitle = query.appBar_Title();
    originTitle = appBarTitle.innerText;
    appBarTitle.innerText = "Gist IDs";

    createInputs();
}

export async function onDestroy() {
    query.appBar_Title().innerText = originTitle;
    cleanup.forEach((fn) => fn());
    cleanup = [];
}

function createInputs() {
    const itemProps: create.GistItemProps[] = [
        {
            title: "Alarm Listen",
            storeKey: "alert-lists",
        },
        {
            title: "Blech Listen",
            storeKey: "metal-sheets",
        },
        {
            title: "VIS",
            storeKey: "vis",
        },
        {
            title: "VIS: Data",
            storeKey: "vis-data",
        },
        {
            title: "Spezial",
            storeKey: "special",
        },
    ];

    const container = document.querySelector<HTMLUListElement>(`.gist-ids`)!;
    for (const itemProp of itemProps) {
        const item = create.gistItem(itemProp);
        cleanup.push(item.destroy);
        container.appendChild(item.element);
    }
}
