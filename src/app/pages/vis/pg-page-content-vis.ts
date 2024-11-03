import { customElement } from "lit/decorators.js";
import PGPageContent from "../pg-page-content";
import { html } from "lit";

@customElement("pg-page-content-vis")
class PGPageContentVis extends PGPageContent<"vis"> {
    protected render() {
        return html``; // TODO: ...
    }
}

export default PGPageContentVis;
