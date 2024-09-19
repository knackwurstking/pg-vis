import svgTrash from "ui/src/svg/smoothie-line-icons/trash";

import { html, ripple, styles, UIDialog, UIDrawerGroupItem } from "ui";
import { info } from "../../data/version";

/**
 * @param {Object} options
 * @param {AlertList_Alert} options.alert
 * @param {string} options.container
 * @param {boolean} [options.hasBorder]
 * @param {boolean} [options.hasRipple]
 * @param {(() => void|Promise<void>) | null} [options.onClick]
 * @returns {HTMLElement}
 */
export function alertItem({
  alert,
  container,
  hasBorder = true,
  hasRipple = true,
}) {
  const el = document.createElement(container);

  el.className = "alert flex row nowrap align-center justify-between";
  el.role = "button";

  el.style.padding = "var(--ui-spacing)";
  el.style.overflow = "hidden";
  el.style.position = "relative";

  if (hasBorder) {
    el.style.borderBottom = `1px solid var(--ui-borderColor)`;
  }

  el.innerHTML = html`
    <div class="title">${alert.alert}</div>

    <div
      class="number"
      style="${styles(
        "color: var(--ui-primary-bgColor, red)",
        "font-weight: bold",
      )}"
    >
      ${alert.from === alert.to ? alert.from : `${alert.from}..${alert.to}`}
    </div>
  `;

  el.setAttribute("data-json", JSON.stringify(alert));
  el.setAttribute("data-alert-item", "");

  if (hasRipple) {
    ripple.create(el);
    el.style.cursor = "pointer";
    el.role = "button";
  }

  return el;
}

/**
 * @param {Object} options
 * @param {Vis_Product} options.product
 * @param {import("ui/src/utils").Events<{ "click": Vis_Product }> | null} [options.events]
 * @param {boolean} [options.hasRipple]
 * @returns {HTMLLIElement}
 */
export function visItem({ product, events = null, hasRipple = true }) {
  const el = document.createElement("li");

  el.classList.add("vis-item");
  el.role = "button";

  el.setAttribute(
    "data-value",
    product.lotto +
      " " +
      product.name +
      " " +
      product.format +
      " " +
      product.stamp +
      " " +
      product.thickness +
      "mm",
  );
  el.setAttribute("data-json", JSON.stringify(product));
  el.setAttribute("data-vis-item", "");

  el.style.display = "block";
  el.style.position = "relative";
  el.style.overflow = "hidden";
  el.style.borderTop = "1px solid var(--ui-borderColor)";
  el.style.borderBottom = "1px solid var(--ui-borderColor)";
  el.style.margin = "var(--ui-spacing) 0";

  el.innerHTML = html`
    <ui-flex-grid>
      <ui-flex-grid-row style="font-size: 1.1rem;">
        <ui-flex-grid-item class="flex justify-center align-center">
          <div
            name="lotto"
            style="font-weight: bold; padding: var(--ui-spacing);"
            align="right"
          >
            ${product.lotto}
          </div>

          <div
            name="name"
            style="font-weight: lighter; padding: var(--ui-spacing);"
          >
            ${product.name}
          </div>
        </ui-flex-grid-item>
      </ui-flex-grid-row>

      <ui-flex-grid-row style="font-size: 0.95rem;">
        <ui-flex-grid-item class="flex justify-center align-center">
          <div name="format" style="padding: var(--ui-spacing);" align="right">
            ${product.format}
          </div>

          <div name="stamp" style="padding: var(--ui-spacing);">
            ${product.stamp}
          </div>

          <div name="thickness" style="padding: var(--ui-spacing);">
            ${product.thickness}mm
          </div>
        </ui-flex-grid-item>
      </ui-flex-grid-row>
    </ui-flex-grid>
  `;

  /** @type {import("ui/src/utils").Ripple | null} */
  let destroyRipple = null;
  if (!!hasRipple) {
    destroyRipple = ripple.create(el, { useClick: true });
    el.style.cursor = "pointer";
  }

  if (!!events) {
    el.onclick = () => {
      events.dispatch("click", product);
    };
  }

  return el;
}

/**
 * @param {Object} options
 * @param {string} options.primary
 * @param {string | null} [options.secondary]
 * @param {(() => void|Promise<void>) | null} [options.onClick]
 * @param {(() => void|Promise<void>) | null} [options.onDelete]
 * @returns {UIDrawerGroupItem}
 */
export function pgDrawerItem({
  primary,
  secondary = null,
  onClick = null,
  onDelete = null,
}) {
  const el = new UIDrawerGroupItem();

  el.innerHTML = html`
    <ui-flex-grid-row>
      <ui-flex-grid-item>
        <ui-button
          name="item"
          style="justify-content: flex-start;"
          color="primary"
          variant="ghost"
        >
          <span>
            <ui-primary>${primary}</ui-primary>
            ${!!secondary
              ? html`
                  <br />
                  <ui-secondary>${secondary}</ui-secondary>
                `
              : ""}
          </span>
        </ui-button>
      </ui-flex-grid-item>

      ${!!onDelete
        ? html`<ui-flex-grid-item
            name="delete"
            class="flex align-center justify-center"
            flex="0"
          >
            <ui-icon-button color="destructive" ghost>
              ${svgTrash}
            </ui-icon-button>
          </ui-flex-grid-item>`
        : ""}
    </ui-flex-grid-row>
  `;

  const deleteItem = el.querySelector(`[name="delete"]`);
  if (!!deleteItem) {
    deleteItem.addEventListener("click", onDelete);
  }

  const mainItem = el.querySelector(`[name="item"]`);
  if (mainItem) {
    mainItem.addEventListener("click", onClick);
  }

  return el;
}

/**
 * @param {Object} options
 * @param {number} options.index
 * @param {VisData_Entry} options.entry
 * @param {import("ui/src/utils").Events<{ "click": { index: number; entry: VisData_Entry } }> | null} [options.events]
 * @param {boolean} [options.hasRipple]
 * @param {boolean} [options.disableFilters]
 * @returns {HTMLLIElement}
 */
export function visDataItem({
  index,
  entry,
  events = null,
  hasRipple = true,
  disableFilters = false,
}) {
  const el = document.createElement("li");

  el.classList.add("vis-data-item");
  el.role = "button";

  el.style.display = "block";
  el.style.position = "relative";
  el.style.overflow = "hidden";
  el.style.borderTop = "1px solid var(--ui-borderColor)";
  el.style.borderBottom = "1px solid var(--ui-borderColor)";
  el.style.margin = "var(--ui-spacing) 0";

  el.innerHTML = html` <ui-label></ui-label> `;

  el.setAttribute("data-index", index.toString());
  el.setAttribute("data-json", JSON.stringify(entry));
  el.setAttribute("data-vis-data-item", "");

  if (!disableFilters) {
    if (!!entry.lotto) {
      el.innerHTML += html`
        <code style="margin: 0.25rem;">Lotto: ${entry.lotto}</code><br />
      `;
    }

    if (!!entry.format || !!entry.stamp || !!entry.thickness) {
      el.innerHTML += `<ui-flex-grid-row gap="0.25rem">`;
    }

    if (!!entry.format) {
      el.innerHTML += html`
        <code style="margin: 0.25rem;">Format: ${entry.format}</code>
      `;
    }

    if (!!entry.stamp) {
      el.innerHTML += html`
        <code style="margin: 0.25rem;">Stempel: ${entry.stamp}</code>
      `;
    }

    if (!!entry.thickness) {
      el.innerHTML += html`
        <code style="margin: 0.25rem;">Stärke: ${entry.thickness}</code>
      `;
    }

    if (!!entry.format || !!entry.stamp || !!entry.thickness) {
      el.innerHTML += `</ui-flex-grid-row>`;
    }
  }

  /** @type {import("ui").UILabel} */
  const label = el.querySelector("ui-label");
  label.ui.primary = entry.key.replaceAll(" ", "&nbsp;");
  label.ui.secondary = entry.value
    .replaceAll(" ", "&nbsp;")
    .replaceAll("\n", "<br />");

  /** @type {import("ui/src/utils").Ripple | null} */
  let destroyRipple = null;
  if (!!hasRipple) {
    el.style.cursor = "pointer";
    destroyRipple = ripple.create(el, { useClick: true });
  }

  if (!!events) {
    el.onclick = () => {
      events.dispatch("click", { index: index, entry });
    };
  }

  return el;
}

export function buildInfoDialog() {
  const dialog = new UIDialog("Changelog");

  dialog.innerHTML = info;

  dialog.ui.fullscreen = true;
  dialog.ui.nofooter = true;

  dialog.ui.events.on("close", () => {
    document.body.removeChild(dialog);
  });

  document.body.appendChild(dialog);
  dialog.ui.open(true);
}
