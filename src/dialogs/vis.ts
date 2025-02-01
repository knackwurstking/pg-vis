import * as types from "../types";
import * as query from "../utils-query";

function init(data?: types.Vis | null): Promise<types.Vis | null> {
    return new Promise((resolve, _reject) => {
        const dialog = query.dialog_VIS();

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
            const date = new Date();

            resolve({
                date: date.getTime(),
                title: titleInput.value || generateDefaultTitle(date),
                data: [],
            });
        };

        const initForm = () => {
            if (!!data) {
                // Set title input (default: YYYY-MM-DD)
                data.title = data.title || generateDefaultTitle(new Date());
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

function generateDefaultTitle(date: Date) {
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
}

export default init;
