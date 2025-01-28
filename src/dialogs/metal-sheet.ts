import * as types from "../types";
import * as query from "../utils-query";

function init(data?: types.MetalSheet | null): Promise<types.MetalSheet | null> {
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
            const header: string[] = [];
            const filter: number[] = [];
            dialog.filters.forEach((filterCheckbox) => {
                header.push(filterCheckbox.value);

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
                        header,
                        data: data?.data.table.data || [],
                    },
                },
            });
        };

        const initForm = () => {
            if (!!data) {
                dialog.format.value = data.format;
                dialog.toolID.value = data.toolID;
                dialog.press.selectedIndex = data.data.press + 1;
                dialog.filters.forEach((filterCheckbox) => {
                    const indexToHide = parseInt(filterCheckbox.value, 10);
                    filterCheckbox.checked = !data.data.table.filter?.includes(indexToHide);
                });
            }
        };

        initForm();

        dialog.reset.onclick = (e) => {
            if (!data) {
                return;
            }

            e.preventDefault();
            initForm();
        };

        dialog.root.showModal();
    });
}

export default init;
