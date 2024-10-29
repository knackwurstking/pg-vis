import svgDownload from "ui/src/svg/smoothie-line-icons/download";

import { html, UIButton, UIDrawerGroupItem, UIIconButton } from "ui";
import { ImportDialog } from "..";
import { git, utils } from "../../lib";

/**
 * @template {any} T
 */
export class PGDrawerItemImport extends UIDrawerGroupItem {
    static register = () => {
        customElements.define("pg-drawer-item-import", PGDrawerItemImport);
    };

    static observedAttributes = ["disabled"];

    constructor() {
        super();

        /** @type {PGStore} */
        this.uiStore = document.querySelector("ui-store");

        /** @type {UIButton} */
        this.importButton = null;
        /** @type {UIIconButton} */
        this.exportButton = null;

        /** @type {(() => void|Promise<void>) | null} */
        this.beforeUpdate = null;
        /** @type {((data: any) => T|Promise<T>) | null} */
        this.onValidate = null;
        /** @type {((data: T) => void|Promise<void>) | null} */
        this.onUpdate = null;

        this.pg = {
            root: this,

            get title() {
                return this.root.getAttribute("title");
            },

            set title(value) {
                if (!value) {
                    this.root.removeAttribute("title");
                    return;
                }

                this.root.setAttribute("title", value);
            },

            get storegistkey() {
                return this.root.getAttribute("storegistkey");
            },

            set storegistkey(value) {
                if (!value) {
                    this.root.removeAttribute("storegistkey");
                    return;
                }

                this.root.setAttribute("storegistkey", value);
            },

            get disabled() {
                return this.root.hasAttribute("disabled");
            },

            set disabled(state) {
                if (!state) {
                    this.root.removeAttribute("disabled");
                    return;
                }

                this.root.setAttribute("disabled", "");
            },

            /** @param {(() => void|Promise<void>) | null} fn */
            setBeforeUpdateHandler(fn) {
                this.root.beforeUpdate = fn;
            },

            /** @param {((data: any, gistID?: string | null) => T|Promise<T>) | null} fn */
            setValidateHandler(fn) {
                this.root.onValidate = fn;
            },

            /** @param {((data: T) => void|Promise<void>) | null} fn */
            setUpdateHandler(fn) {
                this.root.onUpdate = fn;
            },

            /** @param {(() => void|Promise<void>) | null} fn */
            setExportHandler(fn) {
                if (fn === null) {
                    this.root.exportButton.parentElement.style.display = "none";
                    return;
                }

                this.root.exportButton.parentElement.style.display = "flex";
                this.root.exportButton.onclick = () => fn();
            },
        };

        this.render();
    }

    render() {
        this.innerHTML = html`
            <ui-flex-grid-row gap="0.25rem">
                <ui-flex-grid-item>
                    <ui-button variant="full" color="primary">
                        Import
                    </ui-button>
                </ui-flex-grid-item>

                <ui-flex-grid-item
                    class="flex align-center justify-center"
                    style="display: none;"
                    flex="0"
                >
                    <ui-icon-button
                        style="width: 2.5rem; height: 2.5rem;"
                        ghost
                    >
                        ${svgDownload}
                    </ui-icon-button>
                </ui-flex-grid-item>
            </ui-flex-grid-row>
        `;

        this.importButton = this.querySelector(`ui-button`);
        this.importButton.ui.events.on("click", () => this.import());

        this.exportButton = this.querySelector(`ui-icon-button`);
    }

    /**
     * @param {string} name
     * @param {string} _oldValue
     * @param {string} newValue
     */
    attributeChangedCallback(name, _oldValue, newValue) {
        switch (name) {
            case "disabled":
                this.setDisabled(newValue);
                break;
        }
    }

    /** @param {string | null} value */
    setDisabled(value) {
        if (value === null) {
            this.importButton.ui.disabled = false;
            this.exportButton.ui.disabled = false;
            return;
        }

        this.importButton.ui.disabled = true;
        this.importButton.ui.disabled = true;
        this.exportButton.ui.disabled = true;
    }
}
