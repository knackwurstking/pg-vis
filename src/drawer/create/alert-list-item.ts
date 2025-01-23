import * as types from "../../types";

export interface AlertListItemProps {
    data: types.AlertList;
}

export function alertListItem(props: AlertListItemProps): types.Component<HTMLLIElement> {
    const el = document.createElement("li");

    // TODO: Create drawer group list item here for alert lists

    return {
        element: el,
        destroy() {},
    };
}
