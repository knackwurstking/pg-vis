import { customElement } from "lit/decorators.js";

import { html } from "lit";

import * as app from "@app";
import * as types from "@types";

@customElement("pg-page-content-special")
class PGPageContentSpecial extends app.PGPageContent<types.Special> {
    protected render() {
        super.renderListsAppBarTitle("special", this.data);

        switch (this.data?.type) {
            case "flakes":
                return html`<pg-page-content-flakes data=${JSON.stringify(this.data)}>
                </pg-page-content-flakes>`;

            default:
                return html``;
        }
    }
}

export default PGPageContentSpecial;
