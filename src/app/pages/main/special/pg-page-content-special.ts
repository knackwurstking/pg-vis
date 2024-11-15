import { customElement } from "lit/decorators.js";

import * as app from "@app";
import * as types from "@types";
import { html } from "lit";

@customElement("pg-page-content-special")
class PGPageContentSpecial extends app.PGPageContent<types.Special> {
    protected render() {
        switch (this.data?.type) {
            case "flakes":
                this.renderFlakes();
                break;

            default:
                return html``;
        }

        return html``;
    }

    private renderFlakes() {
        return html``; // TODO: Continue here...
    }
}

export default PGPageContentSpecial;
