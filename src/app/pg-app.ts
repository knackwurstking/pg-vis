import { customElement } from "lit/decorators.js";

import { html, LitElement } from "lit";

@customElement("pg-app")
class PGApp extends LitElement {
    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }
    protected render() {
        return html` <span>Nein, nix mehr zu sehen hier!</span> `;
    }
}

export default PGApp;
