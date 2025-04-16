import * as query from "../utils-query";

const drawer = query.drawer();

export function open() {
    drawer.setAttribute("data-ui-open", "");
}

export function close() {
    drawer.removeAttribute("data-ui-open");
}
