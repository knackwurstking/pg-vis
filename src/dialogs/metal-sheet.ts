import * as globals from "../globals";
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
            const filteredIndexes: number[] = [];
            dialog.filters.forEach((filter) => {
                const checkbox = filter.querySelector<HTMLInputElement>(`input[type="checkbox"]`)!;

                if (checkbox.checked) {
                    return;
                }

                const indexToHide = parseInt(checkbox.getAttribute("data-index")!, 10);
                filteredIndexes!.push(indexToHide);
            });

            resolve({
                format,
                toolID,
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
                dialog.format.value = metalSheet.format;
                dialog.toolID.value = metalSheet.toolID;
                dialog.press.selectedIndex = metalSheet.data.press + 1;
                dialog.filters.forEach((filter, index) => {
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

        dialog.reset.onclick = (e) => {
            if (!metalSheet) return;
            e.preventDefault();
            initForm();
        };

        dialog.root.showModal();
    });
}

export default init;
