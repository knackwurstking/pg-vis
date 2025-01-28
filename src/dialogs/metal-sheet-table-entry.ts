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

            resolve(null);
        };

        const initForm = () => {
            if (!!data) {
                // TODO: Set the form values
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
