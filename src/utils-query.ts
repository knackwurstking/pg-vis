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

export function appBar_ButtonDataBase(): HTMLButtonElement {
    return document.querySelector(`#appBarButtonDataBase`)!;
}

export function appBar_ButtonPrinter(): HTMLButtonElement {
    return document.querySelector(`#appBarButtonPrinter`)!;
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

export function dialog_MetalSheetTableEntry(): {
    root: HTMLDialogElement;
    close: HTMLButtonElement;
    labels: NodeListOf<HTMLLabelElement>;
    inputs: NodeListOf<HTMLInputElement>;
    reset: HTMLInputElement;
} {
    const root = document.querySelector<HTMLDialogElement>(
        `dialog[name="metal-sheet-table-entry"]`,
    )!;

    return {
        root,
        close: root.querySelector(`button.close`)!,
        labels: root.querySelectorAll(`label[for]`)!,
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

export function dialog_VISData(): {
    root: HTMLDialogElement;
    close: HTMLButtonElement;
    inputs: NodeListOf<HTMLInputElement>;
    reset: HTMLInputElement;
} {
    const root = document.querySelector<HTMLDialogElement>(`dialog[name="vis-data"]`)!;

    return {
        root,
        close: root.querySelector(`button.close`)!,
        inputs: root.querySelectorAll(`input[type="text"]`)!,
        reset: root.querySelector(`input[type="reset"]`)!,
    };
}

export function dialog_ProductBookmark(): {
    root: HTMLDialogElement;
    close: HTMLButtonElement;
    title: HTMLElement;
    checkboxes: HTMLUListElement;
} {
    const root = document.querySelector<HTMLDialogElement>(`dialog[name="product-bookmark"]`)!;

    return {
        root,
        close: root.querySelector(`button.close`)!,
        title: root.querySelector(`.title`)!,
        checkboxes: root.querySelector(`.checkboxes`)!,
    };
}

export function dialog_VisDataEntry(): {
    root: HTMLDialogElement;
    close: HTMLButtonElement;
    inputs: NodeListOf<HTMLInputElement>;
    reset: HTMLInputElement;
} {
    const root = document.querySelector<HTMLDialogElement>(`dialog[name="vis-data-entry"]`)!;

    return {
        root,
        close: root.querySelector(`button.close`)!,
        inputs: root.querySelectorAll(`.vis-data-entry-input`)!,
        reset: root.querySelector(`input[type="reset"]`)!,
    };
}

export function dialog_SpecialFlakesEntry(): {
    root: HTMLDialogElement;
    close: HTMLButtonElement;
    inputs: HTMLDivElement;
    reset: HTMLInputElement;
} {
    const root = document.querySelector<HTMLDialogElement>(`dialog[name="special-flakes-entry"]`)!;

    return {
        root,
        close: root.querySelector(`button.close`)!,
        inputs: root.querySelector(`.inputs`)!,
        reset: root.querySelector(`input[type="reset"]`)!,
    };
}
