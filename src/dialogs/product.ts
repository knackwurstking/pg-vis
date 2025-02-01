import * as query from "../utils-query";
import * as types from "../types";

function init(data?: types.Product | null): Promise<types.Product | null> {
    return new Promise((resolve, _reject) => {
        const dialog = query.dialog_Product(); // TODO: Create the dialog (html)

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
            const result: types.Product = {
                lotto: dialog.inputs[0].value,
                name: dialog.inputs[1].value,
                format: dialog.inputs[2].value,
                thickness: parseFloat(dialog.inputs[3].value || "0"),
                stamp: dialog.inputs[4].value,
            };

            resolve(result);
        };

        const initForm = () => {
            if (!!data) {
                dialog.inputs[0].value = data.lotto;
                dialog.inputs[1].value = data.name;
                dialog.inputs[2].value = data.format;
                dialog.inputs[3].value = data.thickness.toString();
                dialog.inputs[4].value = data.stamp;
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
