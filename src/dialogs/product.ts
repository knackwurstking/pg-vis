import * as types from "../types";

function init(product?: types.Product | null): types.Component<
    HTMLDialogElement,
    {
        close: HTMLButtonElement;
        inputs: NodeListOf<HTMLInputElement>;
        reset: HTMLInputElement;
    },
    { open: () => Promise<types.Product | null> }
> {
    const root = document.querySelector<HTMLDialogElement>(`dialog[name="product"]`)!;

    const query = {
        close: root.querySelector<HTMLButtonElement>(`button.close`)!,
        inputs: root.querySelectorAll<HTMLInputElement>(`.product-input`)!,
        reset: root.querySelector<HTMLInputElement>(`input[type="reset"]`)!,
    };

    const open: () => Promise<types.Product | null> = () => {
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
                const result: types.Product = {
                    lotto: query.inputs[0].value,
                    name: query.inputs[1].value,
                    format: query.inputs[2].value,
                    thickness: parseFloat(query.inputs[3].value || "0"),
                    stamp: query.inputs[4].value,
                };

                resolve(result);
            };

            const initForm = () => {
                if (!!product) {
                    query.inputs[0].value = product.lotto;
                    query.inputs[1].value = product.name;
                    query.inputs[2].value = product.format;
                    query.inputs[3].value = product.thickness.toString();
                    query.inputs[4].value = product.stamp;
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
        },
        destroy() {},
    };
}

export default init;
