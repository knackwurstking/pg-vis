import { html, LitElement, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { VisDataEntry } from "../../../store-types";

@customElement("pg-vis-data-list-item")
class PGVisDataListItem extends LitElement {
    @property({ type: Object, attribute: "data", reflect: true })
    data?: VisDataEntry;

    @property({ type: Boolean, attribute: "show-filter", reflect: true })
    showFilter?: boolean;

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
        if (this.data === undefined) return html``;

        return html`
            <ui-flex-grid gap="0.25rem">
                ${this.data.key !== null
                    ? html`
                          <ui-flex-grid-item>
                              <ui-primary wght="650"
                                  >${this.data.key}</ui-primary
                              >
                          </ui-flex-grid-item>
                      `
                    : ""}

                <ui-flex-grid-item>
                    <ui-text name="value" mono="1">${this.data.value}</ui-text>
                </ui-flex-grid-item>
            </ui-flex-grid>
        `; // TODO: Adding filter tags to the top or bottom, only if `this.showFilter` is set
    }

    protected updated(_changedProperties: PropertyValues): void {
        this.querySelector(`ui-text[name="value"]`)!.innerHTML = (
            this.data?.value || ""
        )
            .replaceAll("\n", "<br/>")
            .replaceAll(" ", "&nbsp;");
    }
}

export default PGVisDataListItem;
