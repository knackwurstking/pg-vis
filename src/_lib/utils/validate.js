class InvalidError extends Error {
  /**
   * @param {string} key
   * @param {string} type
   */
  constructor(key, type) {
    super(`ungültige Daten: "${key}" vom Typ "${type}" fehlt`);
    /** @type {string} */
    this.key = key;
    /** @type {string} */
    this.type = type;
  }
}

class InvalidAlertError extends Error {
  /**
   * @param {object} data
   */
  constructor(data) {
    super(`ungültige Daten für "alert":\n${JSON.stringify(data, null, 4)}`);
    /** @type {object} */
    this.data = data;
  }
}

class InvalidProductError extends Error {
  /**
   * @param {object} data
   */
  constructor(data) {
    super(`ungültige Daten für "product":\n${JSON.stringify(data, null, 4)}`);
    /** @type {object} */
    this.data = data;
  }
}

class InvalidEntryError extends Error {
  /**
   * @param {object} data
   */
  constructor(data) {
    super(`ungültige Daten für "entry":\n${JSON.stringify(data, null, 4)}`);
    /** @type {object} */
    this.data = data;
  }
}

/**
 * @param {any} data
 * @returns {PGStore_AlertList}
 */
export function alertList(data) {
  if (typeof data?.title !== "string") {
    throw new InvalidError("title", "string");
  }

  if (!Object.hasOwn(data, "data")) {
    data.data = [];
  }

  for (let i = 0; i < data.data.length; i++) {
    const alert = data.data[i];

    if (typeof alert.from !== "number" || typeof alert.to !== "number") {
      throw new InvalidAlertError(alert);
    }

    if (typeof alert.alert !== "string") {
      throw new InvalidAlertError(alert);
    }

    if (!Array.isArray(alert.desc)) {
      throw new InvalidAlertError(alert);
    }

    if (typeof alert.desc === "string") {
      alert.desc = alert.desc.split("\n");
    }

    if (
      !!alert.desc.filter((/** @type {any} */ line) => typeof line !== "string")
        .length
    ) {
      throw new InvalidAlertError(alert);
    }
  }

  return data;
}

/**
 * @param {any} data
 * @returns {PGStore_MetalSheetList}
 */
export function metalSheetList(data) {
  if (typeof data?.format !== "string") {
    throw new InvalidError("format", "string");
  }

  if (typeof data?.toolID !== "string") {
    data.toolID = "";
  }

  if (!Object.hasOwn(data, "data")) {
    data.data = {};
  }

  if (typeof data.data.press !== "number") {
    data.data.press = -1;
  }

  if (!Object.hasOwn(data.data, "table")) {
    data.data.table = {
      header: [],
      data: [],
    };
  } else {
    if (!Object.hasOwn(data.data.table, "header")) {
      data.data.table.header = [];
    }

    if (!Object.hasOwn(data.data.table, "data")) {
      data.data.table.data = [];
    }
  }

  return data;
}

/**
 * @param {any} data
 * @returns {PGStore_Vis}
 */
export function vis(data) {
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return visConvertToJSON(data);
    }
  } else {
    data = data;
  }

  if (typeof data.date !== "number") {
    throw new InvalidError("date", "number");
  }

  if (typeof data.title !== "string") {
    throw new InvalidError("title", "string");
  }

  if (!Array.isArray(data.data)) {
    throw new InvalidError("data", "array");
  }

  for (const part of data.data) {
    visProduct(part);
  }

  return data;
}

/**
 * @param {any} data
 * @returns {PGStore_VisList}
 */
export function visList(data) {
  if (typeof data === "string") {
    data = JSON.parse(data);
  }

  if (typeof data.name !== "string") {
    throw new InvalidError("name", "string");
  }

  if (typeof data.allowDeletion !== "boolean") {
    data.allowDeletion = true;
  }

  if (!Array.isArray(data.data)) {
    throw new InvalidError("data", "array");
  }

  for (const part of data.data) {
    visProduct(part); // NOTE: Throws error if invalid
  }

  return data;
}

/**
 * @param {any} data
 * @returns {PGStore_VisData}
 */
export function visData(data) {
  if (typeof data.title !== "string") {
    throw new InvalidError("title", "string");
  }

  for (const part of data.data) {
    visDataEntry(part); // NOTE: Throws error if invalid
  }

  return data;
}

/**
 * @param {any} data
 * @returns {Vis_Product}
 */
function visProduct(data) {
  if (typeof data.lotto !== "string") {
    throw new InvalidProductError(data);
  }

  if (typeof data.name !== "string") {
    throw new InvalidProductError(data);
  }

  if (typeof data.format !== "string") {
    throw new InvalidProductError(data);
  }

  if (typeof data.thickness !== "number") {
    throw new InvalidProductError(data);
  }

  if (typeof data.stamp !== "string") {
    throw new InvalidProductError(data);
  }

  return data;
}

/**
 * @param {any} data
 * @returns {VisData_Entry} data
 */
function visDataEntry(data) {
  if (typeof data.key !== "string") {
    throw new InvalidEntryError(data);
  }

  if (typeof data.value !== "string") {
    throw new InvalidEntryError(data);
  }

  if (typeof data.lotto !== "string" && data.lotto !== null) {
    throw new InvalidEntryError(data);
  }

  if (typeof data.format !== "string" && data.format !== null) {
    throw new InvalidEntryError(data);
  }

  if (typeof data.thickness !== "string" && data.thickness !== null) {
    throw new InvalidEntryError(data);
  }

  if (typeof data.stamp !== "string" && data.stamp !== null) {
    throw new InvalidEntryError(data);
  }

  return data;
}

/**
 * @param {string} data
 */
function visConvertToJSON(data) {
  /**
   * @param {string} format
   * @returns {string}
   */
  const parseFormat = (format) => {
    const [xString, yString] = format.split(/[xX]/);
    const x = parseFloat(xString);
    const y = parseFloat(yString);

    if (!x || !y) {
      return `${x}x${y}`;
    }

    return `${x > y ? x : y}x${x < y ? x : y}`;
  };

  const date = new Date();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");

  /** @type {PGStore_Vis} */
  const vis = {
    date: date.getTime(),
    title: `${date.getFullYear()}-${m}-${d}`,
    data: [],
  };

  const lines = data.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i]) {
      continue;
    }

    // the first is the lotto code
    let [lotto, ...rest] = lines[i].trim().replace(/\t/g, " ").split(" ");
    lotto = lotto.trim();

    // pass rest to name split until format
    const { productName, format, newRest } = (() => {
      let productName = "";
      let format = "";

      for (let ir = 0; ir < rest.length; ir++) {
        if (rest[ir].match(/^[0-9]+["]?[xX][0-9]+["]?$/)) {
          format = parseFormat(rest[ir]);
          rest = rest.slice(ir + 1);
          break;
        } else {
          productName += rest[ir] + " ";
        }
      }

      return {
        productName: productName.trim(),
        format: parseFormat(format),
        newRest: rest.map((s) => s.trim()).filter((r) => !!r),
      };
    })();

    if (!format) {
      throw `missing format for "${productName}" (lotto: "${lotto}") in vis (txt) data!`;
    }

    if (!(newRest[0] || "").match(/^[0-9]+[,]?[0-9]*$/)) {
      throw `thickness not found for "${productName}" with lotto "${lotto}"!`;
    }

    const thickness = newRest.shift() || "";
    const stamp = newRest.join(" ");

    vis.data.push({
      lotto: lotto,
      name: productName,
      format: format,
      thickness: parseFloat(thickness.replaceAll(",", ".")),
      stamp: stamp,
    });
  }

  return vis;
}
