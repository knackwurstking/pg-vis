import { html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { Alert } from "../../../types";
import PGPageContent from "../pg-page-content";

@customElement("pg-page-content-alert")
class PGPageContentAlert extends PGPageContent<Alert> {
    name = "alert";

    protected render(): TemplateResult<1> {
        console.debug(`Render component`, this);

        return html``;
    }
}

export default PGPageContentAlert;
