import * as query from "../../utils-query";
import * as create from "./create";

let cleanup: (() => void)[] = [];
let originTitle: string = "";

export async function onMount() {
    const appBarTitle = query.appBar_Title();
    originTitle = appBarTitle.innerText;
    appBarTitle.innerText = "Gist IDs";

    const el = routerTargetElements();

    // Enable app bar button for switching to dev mode
    {
        const dataBaseButton = query.appBar_ButtonDataBase();
        dataBaseButton.onclick = async () => {
            el.devModeItems.forEach((child) => {
                if ((child as HTMLElement).style.display === "flex") {
                    (child as HTMLElement).style.display = "none";
                } else {
                    (child as HTMLElement).style.display = "flex";
                }
            });
        };
        dataBaseButton.style.display = "inline-flex";
        cleanup.push(() => {
            dataBaseButton.style.display = "none";
            dataBaseButton.onclick = null;
        });
    }

    render(el);
}

export async function onDestroy() {
    query.appBar_Title().innerText = originTitle;
    cleanup.forEach((fn) => fn());
    cleanup = [];
}

function render(el: { gistIDs: HTMLUListElement }) {
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

    for (const itemProp of itemProps) {
        const item = create.gistItem(itemProp);
        cleanup.push(item.destroy);
        el.gistIDs.appendChild(item.element);
    }
}

function routerTargetElements() {
    const rt = query.routerTarget();

    return {
        devModeItems: rt.querySelectorAll(`.dev-mode`),
        gistIDs: rt.querySelector<HTMLUListElement>(`.gist-ids`)!,
    };
}
