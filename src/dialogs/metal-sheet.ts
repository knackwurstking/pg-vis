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
                return;
            }

            // Checking inputs for format and tool id
            const format = dialog.format.value;
            const toolID = dialog.toolID.value;

            // Check filters
            const header: string[] = [];
            const filter: number[] = [];
            dialog.filters.forEach((filterCheckbox) => {
                header.push(filterCheckbox.textContent!);

                if (filterCheckbox.checked) {
                    return;
                }

                const indexToHide = parseInt(filterCheckbox.value, 10);
                filter!.push(indexToHide);
            });

            resolve({
                format,
                toolID,
                data: {
                    press: -1,
                    table: {
                        filter,
                        header,
                        data: [],
                    },
                },
            });
        };

        // TODO: Set list data to the dialog, if given

        dialog.root.showModal();
    });
}

export default init;
