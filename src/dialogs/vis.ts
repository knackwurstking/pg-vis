import * as types from "../types";

function init(vis?: types.Vis | null): types.Component<
    HTMLDialogElement,
    {
        close: HTMLButtonElement;
        inputs: NodeListOf<HTMLInputElement>;
        reset: HTMLInputElement;
    },
    { open: () => Promise<types.Vis | null> }
> {
    const root = document.querySelector<HTMLDialogElement>(`dialog[name="vis"]`)!;

    const query = {
        close: root.querySelector<HTMLButtonElement>(`button.close`)!,
        inputs: root.querySelectorAll<HTMLInputElement>(`input[type="text"]`)!,
        reset: root.querySelector<HTMLInputElement>(`input[type="reset"]`)!,
    };

    const open: () => Promise<types.Vis | null> = () => {
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
                const date = new Date();

                resolve({
                    date: date.getTime(),
                    title: titleInput.value || generateDefaultTitle(date),
                    data: [],
                });
            };

            const initForm = () => {
                if (!!vis) {
                    const titleInput = query.inputs[0];

                    // Set title input (default: YYYY-MM-DD)
                    titleInput.value = vis.title || generateDefaultTitle(new Date());
                }
            };

            initForm();

            query.reset.onclick = (e) => {
                if (!vis) return;
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

function generateDefaultTitle(date: Date) {
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
}

export default init;
