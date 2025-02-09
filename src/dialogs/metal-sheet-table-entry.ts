import * as globals from "../globals";
import * as types from "../types";

function init(data?: string[] | null): types.Component<
    HTMLDialogElement,
    {
        labels: NodeListOf<HTMLLabelElement>;
        inputs: NodeListOf<HTMLInputElement>;
    },
    { open: () => Promise<string[] | null> }
> {
    const root = document.querySelector<HTMLDialogElement>(
        `dialog[name="metal-sheet-table-entry"]`,
    )!;

    const query = {
        labels: root.querySelectorAll<HTMLLabelElement>(`label[for]`)!,
        inputs: root.querySelectorAll<HTMLInputElement>(`input[type="text"]`)!,
    };

    const open: () => Promise<string[] | null> = () => {
        return new Promise((resolve, _reject) => {
            root.onclose = () => {
                // TODO: Need to check if submit button was pressed before resolving the result

                // Get the values from the dialog form inputs
                const result: string[] = [];
                query.inputs.forEach((input) => {
                    result.push(input.value);
                });

                resolve(result);
            };

            query.labels.forEach((label, index) => {
                label.innerText = globals.metalSheetSlots[index] || "";
            });

            if (!!data) {
                data.forEach((value, index) => {
                    query.inputs[index].value = value;
                });
            }

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
