import * as query from "./utils-query";
import * as globals from "./globals";

export const element = query.drawer();

export function open() {
    query.drawer().setAttribute("open", "");

    globals.store.update("drawer", (data) => {
        data.open = true;
        return data;
    });
}

export function close() {
    query.drawer().removeAttribute("open");

    globals.store.update("drawer", (data) => {
        data.open = false;
        return data;
    });
}
