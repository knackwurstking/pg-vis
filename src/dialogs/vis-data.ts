import * as types from "../types";

function init(visData?: types.VisData | null): types.Component<
    HTMLDialogElement,
    {
        close: HTMLButtonElement;
        inputs: NodeListOf<HTMLInputElement>;
        reset: HTMLInputElement;
    },
    {
        open: () => Promise<types.VisData | null>;
        validate: () => boolean;
    }
> {
    const root = document.querySelector<HTMLDialogElement>(`dialog[name="vis-data"]`)!;

    const query = {
        close: root.querySelector<HTMLButtonElement>(`button.close`)!,
        inputs: root.querySelectorAll<HTMLInputElement>(`input[type="text"]`)!,
        reset: root.querySelector<HTMLInputElement>(`input[type="reset"]`)!,
    };

    const open: () => Promise<types.VisData | null> = () => {
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

                const titleInput = query.inputs[0];

                resolve({
                    title: titleInput.value,
                    data: [],
                });
            };

            const initForm = () => {
                if (!!visData) {
                    const titleInput = query.inputs[0];
                    titleInput.value = visData.title;
                }
            };

            initForm();

            query.reset.onclick = (e) => {
                if (!visData) return;
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
                let valid = true;

                if (query.inputs[0].value) {
                    query.inputs[0].ariaInvalid = "";
                    valid = false;
                } else {
                    query.inputs[0].ariaInvalid = null;
                }

                return valid;
            },
        },
        destroy() {},
    };
}

export default init;
