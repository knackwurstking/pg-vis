import { customElement, property } from "lit/decorators.js";

import { css, html, LitElement, PropertyValues } from "lit";
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
        try {
            return new RegExp("(?=.*" + regexSplit.join(")(?=.*") + ")", "i");
        } catch {
            return new RegExp(
                "(?=.*" +
                    regexSplit
                        .map((part) => part.replace(/[()]/g, "\\$&")) // $& means the whole matched string
                        .join(")(?=.*") +
                    ")",
                "i",
            );
        }
    }

    static get styles() {
        return css`
            * {
                box-sizing: border-box;
            }

            :host {
                z-index: 10;
                position: absolute !important;
                top: var(--ui-app-bar-height);
                left: 0;
                right: 0;
                height: fit-content;
                margin: 0 var(--ui-spacing);
                overflow: hidden;
            }

            :host(:not([active])) ui-search {
                display: none;
            }
        `;
    }

    public value(): string {
        return this.shadowRoot?.querySelector<UISearch>("ui-search")?.value || "";
    }

    protected render() {
        return html`
            <ui-search
                style="z-index: 10;"
                title="${this.title}"
                no-submit
                storage
                storage-prefix="pg-vis-dev:search:"
                storage-key="${this.storageKey}"
                @change=${() => {
                    this.dispatchEvent(new Event("change"));
                }}
            ></ui-search>
        `;
    }

    protected firstUpdated(_changedProperties: PropertyValues): void {
        this.classList.add("has-backdrop-blur");
    }
}

export default PGSearchBar;
