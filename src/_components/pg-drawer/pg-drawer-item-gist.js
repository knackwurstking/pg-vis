import { html, UIButton, UIDrawerGroupItem, UISecondary } from "ui";

export class PGDrawerItemGist extends UIDrawerGroupItem {
  static register = () => {
    customElements.define("pg-drawer-item-gist", PGDrawerItemGist);
  };

  constructor() {
    super();

    /** * @type {PGStore} */
    this.uiStore = document.querySelector("ui-store");

    /** @type {UIButton | null} */
    this.pullButton = null;
    /** @type {UIButton | null} */
    this.pushButton = null;

    this.pg = {
      /** @type {((gistID: string, revision: number) => void|Promise<void>) | null} */
      onPull: null,

      /** @type {((gistID: string, revision: number) => void|Promise<void>) | null} */
      onPush: null,
    };

    this.render();
  }

  render() {
    this.innerHTML = html`
      <ui-flex-grid gap="0.25rem">
        <ui-flex-grid-item style="position: relative;" gap="0.25rem">
          <div class="flex row align-center justify-between">
            <ui-primary>GistID</ui-primary>
            <pg-drawer-revision></pg-drawer-revision>
          </div>
          <ui-secondary style="overflow-wrap: anywhere;">&nbsp;</ui-secondary>
        </ui-flex-grid-item>

        <ui-flex-grid-row gap="0.25rem">
          <ui-flex-grid-item>
            <ui-button name="pull" variant="full" color="secondary">
              Pull
            </ui-button>
          </ui-flex-grid-item>

          <ui-flex-grid-item>
            <ui-button name="push" variant="full" color="secondary">
              Push
            </ui-button>
          </ui-flex-grid-item>
        </ui-flex-grid-row>
      </ui-flex-grid>
    `;

    this.style.display = "none";
    this.style.position = "relative";

    this.pullButton = this.querySelector(`[name="pull"]`);
    this.pushButton = this.querySelector(`[name="push"]`);
  }

  /**
   * @param {string | null} gistID
   * @param {number | null} revision
   */
  set(gistID, revision) {
    /**
     * @type {UISecondary}
     */
    const uiSecondary = this.querySelector("ui-secondary");
    const rev = this.querySelector("pg-drawer-revision");

    if (!gistID) {
      this.style.display = "none";
      uiSecondary.innerHTML = html`&nbsp;`;
      rev.innerHTML = html`Revision: -`;
    } else {
      this.style.display = "block";
      uiSecondary.innerHTML = gistID;
      rev.innerHTML = html`Revision: ${revision}`;
    }

    this.pullButton.onclick = () => {
      if (!!this.pg.onPull) this.pg.onPull(gistID, revision);
    };

    this.pushButton.onclick = () => {
      if (!!this.pg.onPush) this.pg.onPush(gistID, revision);
    };
  }
}
