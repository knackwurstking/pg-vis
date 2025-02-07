import * as types from "../types";

function init(product?: types.VisDataEntry | null): types.Component<
    HTMLDialogElement,
    {
        close: HTMLButtonElement;
        inputs: NodeListOf<HTMLInputElement>;
        reset: HTMLInputElement;
    },
    {
        open: () => Promise<types.VisDataEntry | null>;
        validate: () => boolean;
    }
> {
    const root = document.querySelector<HTMLDialogElement>(`dialog[name="vis-data-entry"]`)!;

    const query = {
        close: root.querySelector<HTMLButtonElement>(`button.close`)!,
        inputs: root.querySelectorAll<HTMLInputElement>(`.vis-data-entry-input`)!,
        reset: root.querySelector<HTMLInputElement>(`input[type="reset"]`)!,
    };

    const open: () => Promise<types.VisDataEntry | null> = () => {
        return new Promise((resolve, _reject) => {
            let canceled = false;
            query.close.onclick = () => {
                canceled = true;
                root.close();
            };

            root.onclose = () => {
                if (canceled) {
                    resolve(null);
                    return;
                }

                // Get the values from the dialog form inputs
                const result: types.VisDataEntry = {
                    key: query.inputs[0].value || null,
                    value: query.inputs[1].value,
                    lotto: query.inputs[2].value || null,
                    format: query.inputs[3].value || null,
                    thickness: query.inputs[4].value || null,
                    stamp: query.inputs[5].value || null,
                };

                resolve(result);
            };

            const initForm = () => {
                if (!!product) {
                    query.inputs[0].value = product.key || "";
                    query.inputs[1].value = product.value || "";
                    query.inputs[2].value = product.lotto || "";
                    query.inputs[3].value = product.format || "";
                    query.inputs[4].value = product.thickness || "";
                    query.inputs[5].value = product.stamp || "";
                }
            };

            initForm();

            query.reset.onclick = (e) => {
                if (!product) return;
                e.preventDefault();
                initForm();
            };

            root.showModal();
        });
    };

    return {
        element: root,
        query,
        utils: {
            open,
            validate() {
                if (!query.inputs[1].value) query.inputs[1].ariaInvalid = "";
                else query.inputs[1].ariaInvalid = null;

                return query.inputs[1].ariaInvalid === null;
            },
        },
        destroy() {},
    };
}

export default init;
