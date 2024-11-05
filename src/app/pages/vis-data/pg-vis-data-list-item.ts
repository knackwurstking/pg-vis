import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { VisDataEntry } from "../../../store-types";

@customElement("pg-vis-data-list-item")
class PGVisDataListItem extends LitElement {
    @property({ type: Object, attribute: "data", reflect: true })
    data?: VisDataEntry;

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        this.style.display = "block";

        this.style.padding = "var(--ui-spacing)";
        this.style.overflow = "hidden";
        this.style.position = "relative";
        this.style.borderRadius = "0";
        this.style.borderBottom = "1px solid hsl(var(--ui-hsl-borderColor)";

        return this;
    }

    protected render() {
        return html``; // TODO: ...
    }
}

export default PGVisDataListItem;
