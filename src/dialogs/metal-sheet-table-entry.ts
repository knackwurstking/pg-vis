import * as globals from "../globals";
import * as types from "../types";

function init(data?: string[] | null): types.Component<
    HTMLDialogElement,
    {
        close: HTMLButtonElement;
        labels: NodeListOf<HTMLLabelElement>;
        inputs: NodeListOf<HTMLInputElement>;
        reset: HTMLInputElement;
    },
    { open: () => Promise<string[] | null> }
> {
    const root = document.querySelector<HTMLDialogElement>(
        `dialog[name="metal-sheet-table-entry"]`,
    )!;

    const query = {
        close: root.querySelector<HTMLButtonElement>(`button.close`)!,
        labels: root.querySelectorAll<HTMLLabelElement>(`label[for]`)!,
        inputs: root.querySelectorAll<HTMLInputElement>(`input[type="text"]`)!,
        reset: root.querySelector<HTMLInputElement>(`input[type="reset"]`)!,
    };

    const open: () => Promise<string[] | null> = () => {
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
                const result: string[] = [];
                query.inputs.forEach((input) => {
                    result.push(input.value);
                });

                resolve(result);
            };

            const initForm = () => {
                query.labels.forEach((label, index) => {
                    label.innerText = globals.metalSheetSlots[index] || "";
                });

                if (!!data) {
                    data.forEach((value, index) => {
                        query.inputs[index].value = value;
                    });
                }
            };

            initForm();

            query.reset.onclick = (e) => {
                if (!data) return;

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
