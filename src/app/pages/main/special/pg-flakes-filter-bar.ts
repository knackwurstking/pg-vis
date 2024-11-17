import { customElement, property } from "lit/decorators.js";

import { html, LitElement } from "lit";

import * as types from "@types";
import { repeat } from "lit/directives/repeat.js";
import { UISearch } from "ui";

/**
 * @fires change
 */
@customElement("pg-flakes-filter-bar")
class PGFlakesFilterBar extends LitElement {
    @property({ type: Object, attribute: "", reflect: false })
    filter: types.FlakesFilter = {
        c1: null,
        main: null,
        towerSlots: [null, null, null, null, null, null],
    };

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    protected render(): unknown {
        return html`
            <ui-flex-grid-row wrap="auto" gap="0.125rem">
                ${repeat(
                    ["C1", "Main", "A", "C", "E", "G", "I", "K"],
                    (slot) => slot,
                    (slot) => html`
                        <ui-input
                            title="${slot}"
                            type="number"
                            @input=${(ev: Event & { currentTarget: UISearch }) => {
                                switch (slot) {
                                    case "C1":
                                        if (ev.currentTarget.value === "") {
                                            this.filter.c1 = null;
                                        } else {
                                            this.filter.c1 = parseFloat(ev.currentTarget.value);
                                        }
                                        break;

                                    case "Main":
                                        if (ev.currentTarget.value === "") {
                                            this.filter.main = null;
                                        } else {
                                            this.filter.main = parseFloat(ev.currentTarget.value);
                                        }
                                        break;

                                    case "A":
                                        if (ev.currentTarget.value === "") {
                                            this.filter.towerSlots[0] = null;
                                        } else {
                                            this.filter.towerSlots[0] = parseFloat(
                                                ev.currentTarget.value,
                                            );
                                        }
                                        break;

                                    case "C":
                                        if (ev.currentTarget.value === "") {
                                            this.filter.towerSlots[1] = null;
                                        } else {
                                            this.filter.towerSlots[1] = parseFloat(
                                                ev.currentTarget.value,
                                            );
                                        }
                                        break;

                                    case "E":
                                        if (ev.currentTarget.value === "") {
                                            this.filter.towerSlots[2] = null;
                                        } else {
                                            this.filter.towerSlots[2] = parseFloat(
                                                ev.currentTarget.value,
                                            );
                                        }
                                        break;

                                    case "G":
                                        if (ev.currentTarget.value === "") {
                                            this.filter.towerSlots[3] = null;
                                        } else {
                                            this.filter.towerSlots[3] = parseFloat(
                                                ev.currentTarget.value,
                                            );
                                        }
                                        break;

                                    case "I":
                                        if (ev.currentTarget.value === "") {
                                            this.filter.towerSlots[4] = null;
                                        } else {
                                            this.filter.towerSlots[4] = parseFloat(
                                                ev.currentTarget.value,
                                            );
                                        }
                                        break;

                                    case "K":
                                        if (ev.currentTarget.value === "") {
                                            this.filter.towerSlots[5] = null;
                                        } else {
                                            this.filter.towerSlots[5] = parseFloat(
                                                ev.currentTarget.value,
                                            );
                                        }
                                        break;
                                }

                                this.dispatchEvent(new Event("change"));
                            }}
                        ></ui-input>
                    `,
                )}
            </ui-flex-grid-row>
        `;
    }
}

export default PGFlakesFilterBar;
