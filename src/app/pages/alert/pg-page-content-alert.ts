import { customElement } from "lit/decorators.js";
import { Alert } from "../../../types";
import PGPageContent from "../pg-page-content";

@customElement("pg-page-content-alert")
class PGPageContentAlert extends PGPageContent<Alert> {
    name = "alert";

    // TODO: ...
}

export default PGPageContentAlert;
