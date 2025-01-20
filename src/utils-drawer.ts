import * as query from "./utils-query";
import * as globals from "./globals";

const drawer = query.drawer();

export function open() {
    drawer.setAttribute("open", "");

    globals.store.update("drawer", (data) => {
        data.open = true;
        return data;
    });
}

export function close() {
    drawer.removeAttribute("open");

    globals.store.update("drawer", (data) => {
        data.open = false;
        return data;
    });
}
