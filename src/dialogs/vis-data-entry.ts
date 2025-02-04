import * as query from "../utils-query";
import * as types from "../types";

function init(product?: types.VisDataEntry | null): Promise<types.VisDataEntry | null> {
    return new Promise((resolve, _reject) => {
        const dialog = query.dialog_VisDataEntry();

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
            const result: types.VisDataEntry = {
                key: dialog.inputs[0].value || null,
                value: dialog.inputs[1].value,
                lotto: dialog.inputs[2].value || null,
                format: dialog.inputs[3].value || null,
                thickness: dialog.inputs[4].value || null,
                stamp: dialog.inputs[5].value || null,
            };

            resolve(result);
        };

        const initForm = () => {
            if (!!product) {
                dialog.inputs[0].value = product.key || "";
                dialog.inputs[1].value = product.value || "";
                dialog.inputs[2].value = product.lotto || "";
                dialog.inputs[3].value = product.format || "";
                dialog.inputs[4].value = product.thickness || "";
                dialog.inputs[5].value = product.stamp || "";
            }
        };

        initForm();

        dialog.reset.onclick = (e) => {
            if (!product) return;
            e.preventDefault();
            initForm();
        };

        dialog.root.showModal();
    });
}

export default init;
