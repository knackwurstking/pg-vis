import {
  getMetalSheetKey,
  getVisDataEntryKey,
  getVisDataKey,
  getVisListKey,
} from ".";

/**
 * @param {PGStore_AlertList[]} alertLists
 * @returns {PGStore_AlertList[]}
 */
export function alertLists(alertLists) {
  const result = [];

  const keys = alertLists.map((list) => `${list.title}`).sort();

  for (const key of keys) {
    result.push(alertLists.find((list) => `${list.title}` === key));
  }

  return result;
}

/**
 * @param {PGStore_MetalSheetList[]} lists
 * @returns {PGStore_MetalSheetList[]}
 */
export function metalSheetLists(lists) {
  const result = [];

  const keys = lists.map((list) => getMetalSheetKey(list)).sort();

  for (const key of keys) {
    result.push(lists.find((list) => getMetalSheetKey(list) === key));
  }

  return result;
}

/**
 * @param {PGStore_VisList[]} lists
 * @returns {PGStore_VisList[]}
 */
export function visLists(lists) {
  const result = [];

  const keys = lists.map((list) => getVisListKey(list)).sort();

  for (const key of keys) {
    result.push(lists.find((list) => getVisListKey(list) === key));
  }

  return result;
}

/**
 * @param {PGStore_VisData[]} lists
 * @returns {PGStore_VisData[]}
 */
export function visData(lists) {
  const result = [];

  const keys = lists.map((list) => getVisDataKey(list)).sort();

  for (const key of keys) {
    result.push(lists.find((list) => getVisDataKey(list) === key));
  }

  return result;
}

/**
 * @param {PGStore_VisData} list
 * @returns {PGStore_VisData}
 */
export function visDataEntries(list) {
  const data = [];

  const dataKeys = list.data.map((e) => getVisDataEntryKey(e)).sort();
  for (const dataKey of dataKeys) {
    data.push(list.data.find((e) => getVisDataEntryKey(e) === dataKey));
  }

  list.data = data;
  return list;
}
