import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("pg-page-content")
class PGPageContent<T> extends LitElement {
    name = "";

    @property({ type: Object, attribute: "data", reflect: false })
    data?: T;

    slot = "";

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }
}

export default PGPageContent;
