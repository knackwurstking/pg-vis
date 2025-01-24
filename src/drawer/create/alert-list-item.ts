import * as types from "../../types";
import * as listsStore from "../../list-stores";

const html = String.raw;
const ls = listsStore.get("alert-lists");

export interface AlertListItemProps {
    data: types.AlertList;
}

export function alertListItem(props: AlertListItemProps): types.Component<HTMLLIElement> {
    const el = document.createElement("li");

    el.className = "ui-flex justify-between";

    el.innerHTML = html`
        <a
            class="ui-flex column align-start justify-center"
            style="width: 100%; height: 100%;"
            href="?listKey=${ls.listKey(props.data)}#alert-lists"
        >
            <span>${props.data.title}</span>
            <span>${props.data.data.length} Einträge</span>
        </a>

        <button variant="ghost" color="destructive"><i class="bi bi-trash"></i></button>
    `;

    return {
        element: el,
        destroy() {},
    };
}
