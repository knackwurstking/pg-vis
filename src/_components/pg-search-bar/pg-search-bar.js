import { html } from "ui";

export class PGSearchBar extends HTMLElement {
  static register = () => {
    customElements.define("pg-search-bar", PGSearchBar);
  };

  static observedAttributes = ["title", "active", "prefix"];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    /** @type {import("ui").UIStackLayout} */
    this.stackLayout = document.querySelector("ui-stack-layout");

    /** @type {import("ui").UISearch<import("ui").UISearch_Events | null>} */
    this.input = null;

    this.pg = {
      root: this,

      get active() {
        return this.root.hasAttribute("active");
      },

      /**
       * @param {boolean} value
       */
      set active(value) {
        if (!value) {
          this.root.removeAttribute("active");
          return;
        }

        this.root.setAttribute("active", "");
      },

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

      get prefix() {
        return this.root.getAttribute("prefix");
      },

      set prefix(value) {
        if (!value) {
          this.root.removeAttribute("prefix");
          return;
        }

        this.root.setAttribute("prefix", value);
      },

      input() {
        return this.root.input;
      },
    };

    this.shadowRender();
  }

  shadowRender() {
    this.shadowRoot.innerHTML = html`
      <style>
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
      </style>

      <ui-search
        style="z-index: 10;"
        nosubmit
        storage
        storageprefix="pg-vis:search:"
        storagekey=""
      ></ui-search>
    `;

    this.input = this.shadowRoot.querySelector("ui-search");
  }

  disconnectedCallback() {
    this.setActive(null);
  }

  /**
   * @param {string} name
   * @param {string | null} _oldValue
   * @param {string | null} newValue
   */
  attributeChangedCallback(name, _oldValue, newValue) {
    switch (name) {
      case "title":
        this.setTitle(newValue);
        break;

      case "active":
        this.setActive(newValue);
        break;

      case "prefix":
        this.setPrefix(newValue);
        break;
    }
  }

  /**
   * @param {string | null} value
   */
  setTitle(value) {
    this.input.ui.title = value || "";
  }

  /**
   * @param {string | null} value
   */
  setActive(value) {
    if (value === null) {
      this.stackLayout.style.setProperty("--pg-search-bar-height", "0rem");
    } else {
      this.stackLayout.style.setProperty("--pg-search-bar-height", "4.5rem");
      this.pg.input().ui.focus();
    }
  }

  /**
   * @param {string | null} value
   */
  setPrefix(value) {
    this.input.ui.storageprefix = "pg-vis:search:" + value || "";
  }
}
