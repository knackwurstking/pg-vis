import * as types from "../../types";

const html = String.raw;

export interface AlertListItemProps {
    data: types.AlertList;
}

export function alertListItem(props: AlertListItemProps): types.Component<HTMLLIElement> {
    const el = document.createElement("li");

    el.innerHTML = html`
        <a
            class="ui-flex column align-start justify-center"
            style="width: 100%; height: 100%;"
            href="#alert-lists"
        >
            <span>${props.data.title}</span>
            <span>${props.data.data.length} Einträge</span>
        </a>
        <!-- TODO: Add delete icon button to the right -->
    `;

    return {
        element: el,
        destroy() {},
    };
}
