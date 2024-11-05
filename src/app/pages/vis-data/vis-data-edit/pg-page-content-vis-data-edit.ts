import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { VisDataEntry } from "../../../../store-types";
import PGPageContent from "../../pg-page-content";

@customElement("pg-page-content-vis-data-edit")
export class PGPageContentVisDataEdit extends PGPageContent<VisDataEntry> {
    protected render() {
        return html``; // TODO: Continue here...
    }
}

export default PGPageContentVisDataEdit;
