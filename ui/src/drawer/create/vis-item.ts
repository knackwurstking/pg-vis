import * as globals from "../../globals";
import * as listsStore from "../../list-stores";
import * as types from "../../types";

const html = String.raw;
const ls = listsStore.get("vis");

export interface VISItemProps {
    data: types.Vis;
}

export function visItem(props: VISItemProps): types.Component<HTMLLIElement> {
    const el = document.createElement("li");

    el.className = "ui-flex justify-between";

    ls.title();
    el.innerHTML = html`
        <a
            class="ui-flex column align-start justify-center"
            style="width: 100%; height: 100%;"
            href="#vis?listKey=${ls.listKey(props.data)}"
        >
            <span>${props.data.title}</span>
            <span>${props.data.data.length} Einträge</span>
        </a>

        <button
            class="delete"
            data-ui-variant="ghost"
            data-ui-color="destructive"
        >
            <i class="bi bi-trash"></i>
        </button>
    `;

    const onClickDelete = () => {
        globals.store.update("vis", (data) => {
            const key = ls.listKey(props.data);

            if (confirm(`"${key}" wirklich löschen?`)) {
                data.lists = data.lists.filter(
                    (list) => ls.listKey(list) !== key,
                );
            }

            return data;
        });
    };

    const deleteButton = el.querySelector<HTMLButtonElement>(`button.delete`)!;
    deleteButton.addEventListener("click", onClickDelete);

    return {
        element: el,
        destroy() {
            deleteButton.removeEventListener("click", onClickDelete);
        },
    };
}
