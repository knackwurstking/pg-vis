export * as create from "./create";
export * as file from "./file";
export * as sort from "./sort";
export * as store from "./store";
export * as validate from "./validate";
export * as events from "./events";

/**
 * @param {PGStore_AlertList} list
 */
export function getAlertListFileName(list) {
  return `AlarmListen_${list.title}.json`;
}

/**
 * @param {PGStore_AlertList} data
 */
export function getAlertListKey(data) {
  return `${data.title}`;
}

/**
 * @param {{ format: string ,toolID: string }} list
 */
export function getMetalSheetFileName(list) {
  return `BlechListen_${list.format}_${list.toolID}.json`;
}

/**
 * @param {{ format: string ,toolID: string }} data
 */
export function getMetalSheetKey(data) {
  return `${data.format}:${data.toolID}`;
}

/**
 * @param {PGStore_Vis} list
 */
export function getVisFileName(list) {
  return `Vis_${list.title}.json`;
}

/**
 * @param {PGStore_Vis} data
 */
export function getVisKey(data) {
  return `${data.title}`;
}

/**
 * @param {{ name: string }} list
 */
export function getVisListFileName(list) {
  return `VisLists_${list.name}.json`;
}

/**
 * @param {{ name: string }} data
 */
export function getVisListKey(data) {
  return `${data.name}`;
}

/**
 * @param {{ title: string }} list
 */
export function getVisDataFileName(list) {
  return `VisData_${list.title}.json`;
}

/**
 * @param {{ title: string }} data
 */
export function getVisDataKey(data) {
  return `${data.title}`;
}

/**
 * @param {VisData_Entry} data
 */
export function getVisDataEntryKey(data) {
  let filter = "";

  if (!!data.lotto) {
    filter += "+" + data.lotto;
  }

  if (!!data.format) {
    filter += "+" + data.format;
  }

  if (!!data.stamp) {
    filter += "+" + data.stamp;
  }

  if (!!data.thickness) {
    filter += "+" + data.thickness;
  }

  return `${data.key}\n${filter}\n${data.value}`;
}
