import * as types from "../types";
import * as query from "../utils-query";

function init(metalSheet?: types.MetalSheet | null): Promise<types.MetalSheet | null> {
    return new Promise((resolve, _reject) => {
        // Open the edit metal sheet dialog for changing "format", "toolID" and filters
        const dialog = query.dialog_MetalSheet();

        let canceled = false;
        dialog.close.onclick = () => {
            canceled = true;
            dialog.root.close();
        };

        dialog.root.onclose = () => {
            if (canceled) {
                resolve(null);
                return;
            }

            // Get the values from the dialog form inputs
            const format = dialog.format.value;
            const toolID = dialog.toolID.value;
            const press = parseInt(
                (dialog.press.children[dialog.press.selectedIndex] as HTMLOptionElement).value,
                10,
            );

            // Get filter from the dialog form inputs
            const filter: number[] = [];
            dialog.filters.forEach((filterCheckbox) => {
                if (filterCheckbox.checked) {
                    return;
                }

                const indexToHide = parseInt(filterCheckbox.getAttribute("data-index")!, 10);
                filter!.push(indexToHide);
            });

            resolve({
                format,
                toolID,
                data: {
                    press: press,
                    table: {
                        filter,
                        data: metalSheet?.data.table.data || [],
                    },
                },
            });
        };

        const initForm = () => {
            if (!!metalSheet) {
                dialog.format.value = metalSheet.format;
                dialog.toolID.value = metalSheet.toolID;
                dialog.press.selectedIndex = metalSheet.data.press + 1;
                dialog.filters.forEach((filterCheckbox) => {
                    const indexToHide = parseInt(filterCheckbox.getAttribute("data-index")!, 10);
                    filterCheckbox.checked = !metalSheet.data.table.filter?.includes(indexToHide);
                });
            }
        };

        initForm();

        dialog.reset.onclick = (e) => {
            if (!metalSheet) return;
            e.preventDefault();
            initForm();
        };

        dialog.root.showModal();
    });
}

export default init;
