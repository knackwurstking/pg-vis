import * as types from "../types";

function init(metalSheet?: types.MetalSheet | null): types.Component<
    HTMLDialogElement,
    {
        format: HTMLInputElement;
        toolID: HTMLInputElement;
        press: HTMLSelectElement;
    },
    {
        open: () => Promise<types.MetalSheet | null>;
        validate: () => boolean;
    }
> {
    const root = document.querySelector<HTMLDialogElement>(`dialog[name="metal-sheet"]`)!;

    const query = {
        format: root.querySelector<HTMLInputElement>(`input#metalSheetDialog_Format`)!,
        toolID: root.querySelector<HTMLInputElement>(`input#metalSheetDialog_ToolID`)!,
        press: root.querySelector<HTMLSelectElement>(`select#metalSheetDialog_Press`)!,
    };

    const open: () => Promise<types.MetalSheet | null> = () => {
        return new Promise((resolve, _reject) => {
            root.onclose = () => {
                const press = parseInt(
                    (query.press.children[query.press.selectedIndex] as HTMLOptionElement).value,
                    10,
                );

                resolve({
                    format: query.format.value,
                    toolID: query.toolID.value,
                    data: {
                        press: press,
                        table: {
                            filter: metalSheet?.data.table.filter || [],
                            data: metalSheet?.data.table.data || [],
                        },
                    },
                });
            };

            if (!!metalSheet) {
                query.format.value = metalSheet.format;
                query.toolID.value = metalSheet.toolID;

                query.press.selectedIndex = 0;
                let index = 0;
                for (const option of query.press.options) {
                    if (option.value === metalSheet.data.press.toString()) {
                        query.press.selectedIndex = index;
                        break;
                    }

                    index++;
                }
            }

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
