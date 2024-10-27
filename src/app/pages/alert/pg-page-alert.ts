import { customElement } from "lit/decorators.js";
import PGPageBase from "../pg-page-base";
import { Alert } from "../../../types";

@customElement("pg-page-alert")
class PGPageAlert extends PGPageBase<Alert> {
    name = "alert";

    // TODO: ...

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }
}

export default PGPageAlert;
