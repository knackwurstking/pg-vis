import * as globals from "../globals";
import * as types from "../types";

function init(metalSheet?: types.MetalSheet | null): types.Component<
    HTMLDialogElement,
    {
        close: HTMLButtonElement;
        format: HTMLInputElement;
        toolID: HTMLInputElement;
        press: HTMLSelectElement;
        filters: NodeListOf<HTMLLIElement>;
        reset: HTMLInputElement;
    },
    {
        open: () => Promise<types.MetalSheet | null>;
        validate: () => boolean;
    }
> {
    const root = document.querySelector<HTMLDialogElement>(`dialog[name="metal-sheet"]`)!;

    const query = {
        close: root.querySelector<HTMLButtonElement>(`button.close`)!,
        format: root.querySelector<HTMLInputElement>(`input#metalSheetDialog_Format`)!,
        toolID: root.querySelector<HTMLInputElement>(`input#metalSheetDialog_ToolID`)!,
        press: root.querySelector<HTMLSelectElement>(`select#metalSheetDialog_Press`)!,
        filters: root.querySelectorAll<HTMLLIElement>(`.filters .filter`)!,
        reset: root.querySelector<HTMLInputElement>(`input[type="reset"]`)!,
    };

    const open: () => Promise<types.MetalSheet | null> = () => {
        return new Promise((resolve, _reject) => {
            let canceled = false;
            query.close.onclick = () => {
                canceled = true;
                root.close();
            };

            root.onclose = () => {
                if (canceled) {
                    // Reset validations
                    query.format.ariaInvalid = null;
                    query.toolID.ariaInvalid = null;
                    resolve(null);
                    return;
                }

                // Get the values from the dialog form inputs
                const press = parseInt(
                    (query.press.children[query.press.selectedIndex] as HTMLOptionElement).value,
                    10,
                );

                // Get filter from the dialog form inputs
                const filteredIndexes: number[] = [];
                query.filters.forEach((filter) => {
                    const checkbox =
                        filter.querySelector<HTMLInputElement>(`input[type="checkbox"]`)!;

                    if (checkbox.checked) {
                        return;
                    }

                    const indexToHide = parseInt(checkbox.getAttribute("data-index")!, 10);
                    filteredIndexes!.push(indexToHide);
                });

                resolve({
                    format: query.format.value,
                    toolID: query.toolID.value,
                    data: {
                        press: press,
                        table: {
                            filter: filteredIndexes,
                            data: metalSheet?.data.table.data || [],
                        },
                    },
                });
            };

            const initForm = () => {
                if (!!metalSheet) {
                    query.format.value = metalSheet.format;
                    query.toolID.value = metalSheet.toolID;
                    query.press.selectedIndex = metalSheet.data.press + 1;

                    query.filters.forEach((filter, index) => {
                        filter.querySelector<HTMLInputElement>(`label > span`)!.innerText =
                            globals.metalSheetSlots[index] || "";

                        const checkbox =
                            filter.querySelector<HTMLInputElement>(`input[type="checkbox"]`)!;

                        const indexToHide = parseInt(checkbox.getAttribute("data-index")!, 10);
                        checkbox.checked = !metalSheet.data.table.filter?.includes(indexToHide);
                    });
                }
            };

            initForm();

            query.reset.onclick = (e) => {
                if (!metalSheet) return;
                e.preventDefault();
                initForm();
            };

            root.showModal();
        });
    };

    return {
        element: root,
        query,
        utils: {
            open,
            validate() {
                let valid = true;

                if (!query.format.value) {
                    query.format.ariaInvalid = "";
                    valid = false;
                } else {
                    query.format.ariaInvalid = null;
                }

                if (!query.toolID.value) {
                    query.toolID.ariaInvalid = "";
                    valid = false;
                } else {
                    query.toolID.ariaInvalid = null;
                }

                return valid;
            },
        },
        destroy() {},
    };
}

export default init;
