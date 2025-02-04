import * as types from "../types";
import * as query from "../utils-query";

function init(visData?: types.VisData | null): Promise<types.VisData | null> {
    return new Promise((resolve, _reject) => {
        const dialog = query.dialog_VISData();

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

            const titleInput = dialog.inputs[0];

            resolve({
                title: titleInput.value,
                data: [],
            });
        };

        const initForm = () => {
            if (!!visData) {
                const titleInput = dialog.inputs[0];
                titleInput.value = visData.title;
            }
        };

        initForm();

        dialog.reset.onclick = (e) => {
            if (!visData) return;
            e.preventDefault();
            initForm();
        };

        dialog.root.showModal();
    });
}

export default init;
