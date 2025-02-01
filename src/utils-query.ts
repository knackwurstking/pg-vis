import * as types from "./types";

// Router

export function routerTarget(): HTMLElement {
    return document.querySelector(`#routerTarget`)!;
}

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

export function appBar_ButtonListEdit(): HTMLButtonElement {
    return document.querySelector(`#appBarButtonListEdit`)!;
}

export function appBar_ButtonAdd(): HTMLButtonElement {
    return document.querySelector(`#appBarButtonAdd`)!;
}

export function appBar_ButtonBookmarks(): HTMLButtonElement {
    return document.querySelector(`#appBarButtonBookmarks`)!;
}

export function appBar_ButtonBookmarksFill(): HTMLButtonElement {
    return document.querySelector(`#appBarButtonBookmarksFill`)!;
}

// Drawer Elements

export function drawer(): HTMLElement {
    return document.querySelector(`aside.ui-drawer`)!;
}

export function drawerGistIDsButton(): HTMLButtonElement {
    return drawer().querySelector(`button.gist-ids`)!;
}

export function drawerGroup(name: types.DrawerGroups): {
    root: HTMLDetailsElement;
    actions: {
        download: HTMLButtonElement | null;
        add: HTMLButtonElement | null;
        importFromFile: HTMLButtonElement | null;
    };
    items: HTMLUListElement;
} {
    const group = drawer().querySelector(`.group[name="${name}"]`)!;
    return {
        root: group as HTMLDetailsElement,
        actions: {
            download: group.querySelector(`button.download`) || null,
            add: group.querySelector(`button.add`) || null,
            importFromFile: group.querySelector(`button.import-from-file`) || null,
        },
        items: group.querySelector(`ul.items`)!,
    };
}

export function drawerBackdrop(): HTMLElement {
    return document.querySelector(`div.ui-drawer-backdrop`)!;
}

// Dialog Elements

export function dialog_MetalSheet(): {
    root: HTMLDialogElement;
    close: HTMLButtonElement;
    format: HTMLInputElement;
    toolID: HTMLInputElement;
    press: HTMLSelectElement;
    filters: NodeListOf<HTMLInputElement>;
    reset: HTMLInputElement;
} {
    const root = document.querySelector<HTMLDialogElement>(`dialog[name="metal-sheet"]`)!;

    return {
        root,
        close: root.querySelector(`button.close`)!,
        format: root.querySelector(`input#metalSheetDialog_Format`)!,
        toolID: root.querySelector(`input#metalSheetDialog_ToolID`)!,
        press: root.querySelector(`select#metalSheetDialog_Press`)!,
        filters: root.querySelectorAll(`.filters input[type="checkbox"]`),
        reset: root.querySelector(`input[type="reset"]`)!,
    };
}

export function dialog_MetalSheetTableEntry(): {
    root: HTMLDialogElement;
    close: HTMLButtonElement;
    inputs: NodeListOf<HTMLInputElement>;
    reset: HTMLInputElement;
} {
    const root = document.querySelector<HTMLDialogElement>(
        `dialog[name="metal-sheet-table-entry"]`,
    )!;

    return {
        root,
        close: root.querySelector(`button.close`)!,
        inputs: root.querySelectorAll(`input[type="text"]`)!,
        reset: root.querySelector(`input[type="reset"]`)!,
    };
}

export function dialog_VIS(): {
    root: HTMLDialogElement;
    close: HTMLButtonElement;
    inputs: NodeListOf<HTMLInputElement>;
    reset: HTMLInputElement;
} {
    const root = document.querySelector<HTMLDialogElement>(`dialog[name="vis"]`)!;

    return {
        root,
        close: root.querySelector(`button.close`)!,
        inputs: root.querySelectorAll(`input[type="text"]`)!,
        reset: root.querySelector(`input[type="reset"]`)!,
    };
}

export function dialog_Product(): {
    root: HTMLDialogElement;
    close: HTMLButtonElement;
    inputs: NodeListOf<HTMLInputElement>;
    reset: HTMLInputElement;
} {
    const root = document.querySelector<HTMLDialogElement>(`dialog[name="product"]`)!;

    return {
        root,
        close: root.querySelector(`button.close`)!,
        inputs: root.querySelectorAll(`.product-input`)!,
        reset: root.querySelector(`input[type="reset"]`)!,
    };
}

export function dialog_Choose(): {
    root: HTMLDialogElement;
    close: HTMLButtonElement;
    choices: HTMLDivElement;
} {
    const root = document.querySelector<HTMLDialogElement>(`dialog[name="choose"]`)!;

    return {
        root,
        close: root.querySelector(`button.close`)!,
        choices: root.querySelector(`.choices`)!,
    };
}
