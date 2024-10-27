import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Alert } from "../types";

@customElement("pg-alert-list-item")
class PGAlertListItem extends LitElement {
    @property({ type: Object, attribute: "data", reflect: false })
    data?: Alert;

    // TODO: ...
}

export default PGAlertListItem;
