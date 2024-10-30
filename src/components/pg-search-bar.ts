import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("pg-search-bar")
class PGSearchBar extends LitElement {
    @property({ type: Boolean, attribute: "active", reflect: true })
    active?: boolean;

    static get styles() {
        return css`
            * {
                box-sizing: border-box;
            }

            :host {
                display: none;
                position: absolute !important;
                top: var(--ui-app-bar-height);
                left: 0;
                right: 0;
                height: var(--pg-search-bar-height);
                padding: var(--ui-spacing);
                overflow: hidden;
            }

            :host([active]) {
                display: block;
            }
        `;
    }

    protected render() {
        return html`
            <ui-search
                style="z-index: 10;"
                no-submit
                storage
                storage-prefix="pg-vis:search:"
                storage-key=""
                @change=${() => {
                    this.dispatchEvent(new Event("change"));
                }}
            ></ui-search>
        `;
    }
}

export default PGSearchBar;
