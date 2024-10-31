import { html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { newListsStore } from "../../../lib/lists-store";
import { MetalSheet } from "../../../store-types";
import PGApp from "../../pg-app";
import PGPageContent from "../pg-page-content";

@customElement("pg-page-content-metal-sheets")
class PGPageContentMetalSheets extends PGPageContent<MetalSheet> {
    protected render(): TemplateResult<1> {
        PGApp.queryAppBar()!.contentName("title")!.contentAt(0).innerText =
            this.data !== undefined
                ? newListsStore("metalSheets").fileName(this.data)
                : "Bleck Liste";

        return html``; // TODO: Continue here...
    }
}

export default PGPageContentMetalSheets;
