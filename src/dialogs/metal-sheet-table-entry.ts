import * as globals from "../globals";
import * as query from "../utils-query";

function init(data?: string[] | null): Promise<string[] | null> {
    return new Promise((resolve, _reject) => {
        const dialog = query.dialog_MetalSheetTableEntry();

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
            const result: string[] = [];
            dialog.inputs.forEach((input) => {
                result.push(input.value);
            });

            resolve(result);
        };

        const initForm = () => {
            dialog.labels.forEach((label, index) => {
                label.innerText = globals.metalSheetSlots[index];
            });

            if (!!data) {
                data.forEach((value, index) => {
                    dialog.inputs[index].value = value;
                });
            }
        };

        initForm();

        dialog.reset.onclick = (e) => {
            if (!data) return;

            e.preventDefault();
            initForm();
        };

        dialog.root.showModal();
    });
}

export default init;
