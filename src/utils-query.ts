import * as types from "./types";

// App Bar Elements

export function appBar_ButtonOpenDrawer(): HTMLButtonElement {
    return document.querySelector(`#appBarButtonOpenDrawer`)!;
}

export function appBar_ButtonBack(): HTMLButtonElement {
    return document.querySelector(`#appBarButtonBack`)!;
}

export function appBar_Title(): HTMLHeadingElement {
    return document.querySelector(`#appBarTitle`)!;
}

export function appBar_ButtonEdit(): HTMLButtonElement {
    return document.querySelector(`#appBarButtonEdit`)!;
}

export function appBar_ButtonShare(): HTMLButtonElement {
    return document.querySelector(`#appBarButtonShare`)!;
}

export function appBar_ButtonSearch(): HTMLButtonElement {
    return document.querySelector(`#appBarButtonSearch`)!;
}

export function appBar_ButtonTrash(): HTMLButtonElement {
    return document.querySelector(`#appBarButtonTrash`)!;
}

export function appBar_ButtonPrinter(): HTMLButtonElement {
    return document.querySelector(`#appBarButtonPrinter`)!;
}

// Drawer Elements

export function drawer(): HTMLElement {
    return document.querySelector(`aside.ui-drawer`)!;
}

export function drawerGroup(name: types.DrawerGroups): HTMLDetailsElement {
    return drawer().querySelector(`.group[name="${name}"]`)!;
}

export function drawerBackdrop(): HTMLElement {
    return document.querySelector(`div.ui-drawer-backdrop`)!;
}
