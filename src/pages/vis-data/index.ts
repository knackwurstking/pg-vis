import * as query from "../../utils-query";

export async function onMount() {
    const el = routerTargetElements();

    // TODO: ...
}

export async function onDestroy() {
    console.debug("onDestroy");
}

function routerTargetElements() {
    const rt = query.routerTarget();

    return {
        searchBarInput: rt.querySelector<HTMLInputElement>(`.search-bar input[type="search"]`)!,
        dataList: rt.querySelector<HTMLUListElement>(`.data-list`)!,
    };
}
