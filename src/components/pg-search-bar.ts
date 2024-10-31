import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { UISearch } from "ui";

@customElement("pg-search-bar")
class PGSearchBar extends LitElement {
    @property({ type: String, attribute: "title", reflect: true })
    title: string = "";

    @property({ type: String, attribute: "storage-key", reflect: true })
    storageKey: string = "";

    @property({ type: Boolean, attribute: "active", reflect: true })
    active?: boolean;

    static generateRegExp(value: string): RegExp {
        const regexSplit: string[] = value.split(" ").filter((v) => v !== "");
        return new RegExp("(" + regexSplit.join("|") + ")", "i");
    }

    static get styles() {
        return css`
            * {
                box-sizing: border-box;
            }

            :host {
                position: absolute !important;
                top: var(--ui-app-bar-height);
                left: 0;
                right: 0;
                height: fit-content;
                margin: var(--ui-spacing);
                overflow: hidden;
            }

            :host(:not([active])) ui-search {
                display: none;
            }
        `;
    }

    protected render() {
        return html`
            <ui-search
                style="z-index: 10;"
                title="${this.title}"
                no-submit
                storage
                storage-prefix="pg-vis:search:"
                storage-key="${this.storageKey}"
                @storage=${() => console.debug("Storage event fired...")}
                @change=${() => {
                    this.dispatchEvent(new Event("change"));
                }}
            ></ui-search>
        `;
    }

    public value(): string {
        return (
            this.shadowRoot?.querySelector<UISearch>("ui-search")?.value || ""
        );
    }
}

export default PGSearchBar;
