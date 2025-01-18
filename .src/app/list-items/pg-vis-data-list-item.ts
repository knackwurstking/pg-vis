import { customElement, property } from "lit/decorators.js";

import { html, LitElement, PropertyValues } from "lit";

import * as app from "@app";
import * as types from "@types";

@customElement("pg-vis-data-list-item")
class PGVisDataListItem extends LitElement {
    @property({ type: Object, attribute: "data", reflect: true })
    data?: types.VisDataEntry;

    @property({ type: Boolean, attribute: "route", reflect: true })
    route?: boolean;

    @property({ type: String, attribute: "list-key", reflect: true })
    listKey?: string;

    /**
     * I need this `entryIndex` to for the "pg-page-content-vis-data"
     */
    @property({ type: Number, attribute: "entry-index", reflect: true })
    entryIndex?: number;

    @property({ type: Boolean, attribute: "show-filter", reflect: true })
    showFilter?: boolean;

    private clickHandler = () => {
        app.PGApp.queryStackLayout()!.setPage(
            "visDataEdit",
            (page) => {
                const content = page.children[0] as app.PGPageContentVisDataEdit | undefined;

                if (content !== undefined) {
                    content.data = this.data;
                    content.listKey = this.listKey;
                    content.entryIndex = this.entryIndex;
                }
            },
            true,
        );
    };

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
                              <ui-primary wght="650"> ${this.data.key} </ui-primary>
                          </ui-flex-grid-item>
                      `
                    : ""}
                ${this.renderFilterTags()}

                <ui-flex-grid-item>
                    <ui-text name="value">${this.data.value}</ui-text>
                </ui-flex-grid-item>
            </ui-flex-grid>
        `;
    }

    protected updated(_changedProperties: PropertyValues): void {
        this.querySelector(`ui-text[name="value"]`)!.innerHTML = (
            this.data?.value || ""
        ).replaceAll("\n", "<br/>");

        if (this.route) {
            this.addEventListener("click", this.clickHandler);
            this.role = "button";
            this.style.cursor = "pointer";
        } else {
            this.removeEventListener("click", this.clickHandler);
            this.role = null;
            this.style.cursor = "default";
        }
    }

    private renderFilterTags() {
        if (this.data === undefined || !this.showFilter) return html``;

        const content = [];

        if (this.data.lotto !== null) {
            content.push(html`
                <ui-flex-grid-item flex="0">
                    <code>${this.data.lotto}</code>
                </ui-flex-grid-item>
            `);
        }

        if (this.data.format !== null) {
            content.push(html`
                <ui-flex-grid-item flex="0">
                    <code>${this.data.format}</code>
                </ui-flex-grid-item>
            `);
        }

        if (this.data.stamp !== null) {
            content.push(html`
                <ui-flex-grid-item flex="0">
                    <code>${this.data.stamp}</code>
                </ui-flex-grid-item>
            `);
        }

        if (this.data.thickness !== null) {
            content.push(html`
                <ui-flex-grid-item flex="0">
                    <code>${this.data.thickness}</code>
                </ui-flex-grid-item>
            `);
        }

        return html`
            <ui-flex-grid gap="0">
                ${content.length > 0 ? html`<ui-secondary>Filter</ui-secondary>` : ""}
                <ui-flex-grid-row gap="0.25rem"> ${content} </ui-flex-grid-row>
            </ui-flex-grid>

            ${content.length > 0 ? html`<br />` : ""}
        `;
    }
}

export default PGVisDataListItem;
