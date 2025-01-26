import * as types from "../../types";
import * as listsStore from "../../list-stores";

const html = String.raw;
const ls = listsStore.get("metal-sheets");

export interface MetalSheetItemProps {
    data: types.MetalSheet;
}

export function metalSheetItem(props: MetalSheetItemProps): types.Component<HTMLLIElement> {
    const el = document.createElement("li");

    el.className = "ui-flex justify-between";

    const pressString = props.data.data.press > -1 ? `[P${props.data.data.press}]` : "";

    el.innerHTML = html`
        <a
            class="ui-flex column align-start justify-center"
            style="width: 100%; height: 100%;"
            href="#metal-sheets?listKey=${ls.listKey(props.data)}"
        >
            <span>${pressString} ${props.data.format} ${props.data.toolID}</span>
            <span>${props.data.data.table.data.length} Einträge</span>
        </a>

        <button variant="ghost" color="destructive"><i class="bi bi-trash"></i></button>
    `;

    // TODO: Delete button handler

    return {
        element: el,
        destroy() {},
    };
}
