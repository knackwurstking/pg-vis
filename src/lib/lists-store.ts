import { AlertList, MetalSheet, PGStore } from "../store-types";

export interface ListsStoreData {
    alertLists: AlertList;
    metalSheets: MetalSheet;
}

export class ListsStore<T extends keyof ListsStoreData> {
    key(): keyof ListsStoreData {
        return "" as keyof ListsStoreData;
    }

    listKey(list: ListsStoreData[T]): string {
        if ("title" in list) return list.title as string;
        return "unknown";
    }

    title(): string {
        return "";
    }

    fileName(list: ListsStoreData[T]): string {
        return `${this.listKey(list)}.json`;
    }

    zipFileName(): string {
        return `${new Date().getTime()}.zip`;
    }

    validate(list: any): ListsStoreData[T] | null {
        return list;
    }

    sort(data: ListsStoreData[T][]): ListsStoreData[T][] {
        const result: ListsStoreData[T][] = [];

        const keys = data.map((list) => `${this.listKey(list)}`).sort();

        for (const key of keys) {
            const keyData = data.find(
                (list) => `${this.listKey(list)}` === key,
            );
            if (keyData !== undefined) result.push(keyData);
        }

        return result;
    }

    replaceInStore(
        store: PGStore,
        newList: ListsStoreData[T],
        oldList: ListsStoreData[T],
    ) {
        const newListKey = this.listKey(newList);
        const oldListKey = this.listKey(oldList);

        if (oldListKey !== newListKey) {
            for (const list of store.getData(
                this.key() as keyof ListsStoreData,
            ) || []) {
                if (this.listKey(list as any) === newListKey) {
                    throw new Error(
                        `Liste "${newListKey}" existiert bereits!"`,
                    );
                }
            }
        }

        store.updateData(this.key() as keyof ListsStoreData, (data) => {
            for (let i = 0; i < data.length; i++) {
                if (this.listKey(data[i] as ListsStoreData[T]) === oldListKey) {
                    data[i] = newList;
                }
            }

            return data;
        });
    }

    addToStore(store: PGStore, newData: ListsStoreData[T][], sort?: boolean) {
        const storeData = store.getData(this.key() as keyof ListsStoreData);
        if (storeData === undefined) {
            return;
        }

        const filteredData = storeData.filter((storeList) => {
            const data = newData.find(
                (list) =>
                    this.listKey(list) ===
                    this.listKey(storeList as ListsStoreData[T]),
            );

            return data === undefined;
        });

        const mergedData = [...filteredData, ...newData];

        store.setData(
            this.key() as keyof ListsStoreData,
            (sort
                ? this.sort(mergedData as ListsStoreData[T][])
                : mergedData) as any[],
        );
    }
}

export class AlertListsStore extends ListsStore<"alertLists"> {
    key(): keyof ListsStoreData {
        return "alertLists";
    }

    listKey(list: AlertList): string {
        return list.title;
    }

    title(): string {
        return "Alarm Listen";
    }

    fileName(list: AlertList): string {
        return `Alarm Liste - ${super.fileName(list)}`;
    }

    zipFileName(): string {
        return `${this.title()} - ${super.zipFileName()}`;
    }

    validate(list: any): AlertList | null {
        if (typeof list?.title !== "string") return null;
        if (!("data" in list)) return null;
        if (!Array.isArray(list.data)) return null;

        for (const part of list.data) {
            if (
                !(
                    "from" in part &&
                    "to" in part &&
                    "alert" in part &&
                    "desc" in part
                )
            ) {
                return null;
            }

            if (
                typeof part.from !== "number" ||
                typeof part.to !== "number" ||
                typeof part.alert !== "string"
            ) {
                return null;
            }

            if (typeof part.desc === "string")
                part.desc = part.desc.split("\n");

            if (!Array.isArray(part.desc)) return null;

            if (
                (part.desc as any[]).filter((line) => typeof line !== "string")
                    .length > 0
            ) {
                return null;
            }
        }

        return list;
    }
}

export class MetalSheetsStore extends ListsStore<"metalSheets"> {
    key(): keyof ListsStoreData {
        return "metalSheets";
    }

    listKey(list: MetalSheet): string {
        return `${list.format} ${list.toolID}`;
    }

    title(): string {
        return "Blech Listen";
    }

    fileName(list: MetalSheet): string {
        return `Blech Liste - ${super.fileName(list)}`;
    }

    zipFileName(): string {
        return `${this.title()} - ${super.zipFileName()}`;
    }

    validate(list: any): MetalSheet | null {
        if (typeof list.format !== "string") return null;

        if (!list.toolID) list.toolID = "";
        if (typeof list.toolID !== "string") return null;

        if (!("data" in list)) return null;

        if (typeof list.data !== "object") return null;
        if (typeof list.data.press !== "number") return null;

        if (!("table" in list.data)) {
            list.data.table = { header: [], data: [] };
        } else {
            if (typeof list.data.table !== "object") return null;

            if (!("header" in list.data.table)) return null;
            if (!("data" in list.data.table)) return null;

            if (
                !Array.isArray(list.data.table.header) ||
                !Array.isArray(list.data.table.data)
            ) {
                return null;
            }

            for (const s of list.data.table.header) {
                if (typeof s !== "string") return null;
            }

            for (const part of list.data.table.data) {
                for (const s of part) {
                    if (typeof s !== "string") return null;
                }
            }
        }

        return list;
    }
}

export function newListsStore<T extends keyof ListsStoreData>(
    key: T,
): ListsStore<T> {
    switch (key) {
        case "alertLists":
            return new AlertListsStore() as ListsStore<T>;
        case "metalSheets":
            return new MetalSheetsStore() as ListsStore<T>;
        default:
            throw new Error(`unknown "${key}"`);
    }
}
