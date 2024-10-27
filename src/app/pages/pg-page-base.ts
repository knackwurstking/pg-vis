import { customElement, property } from "lit/decorators.js";
import { UIStackLayoutPage } from "ui";

@customElement("pg-page-base")
class PGPageBase<T> extends UIStackLayoutPage {
    name = "";

    @property({ type: Object, attribute: "data", reflect: false })
    data?: T;
}

export default PGPageBase;
