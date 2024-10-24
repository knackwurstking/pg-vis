export class PGDrawerRevision extends HTMLElement {
  static register = () => {
    customElements.define("pg-drawer-revision", PGDrawerRevision);
  };

  constructor() {
    super();
    this.style.fontSize = "0.85rem";
    this.style.fontVariationSettings = "var(--ui-input-fontVariation)";
  }
}
