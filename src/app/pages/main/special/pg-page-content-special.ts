import { html } from "lit";
import { customElement } from "lit/decorators.js";

import * as app from "@app";
import * as types from "@types";

// TODO: Convert table to pdf for type "flakes"
@customElement("pg-page-content-special")
class PGPageContentSpecial extends app.PGPageContent<types.Special> {
    protected render() {
        super.renderListsAppBarTitle("special", this.data);

        switch (this.data?.type) {
            case "flakes":
                this.renderFlakes(this.data.data);
                break;

            default:
                return html``;
        }

        return html``;
    }

    private renderFlakes(data: types.FlakesData[]) {
        return html``;
    }
}

export default PGPageContentSpecial;
