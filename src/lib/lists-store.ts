import PGApp from "../app/pg-app";
import { AlertList, MetalSheet, PGStoreEvents } from "../store-types";

export interface ListsStoreData {
    alertLists: AlertList;
    metalSheets: MetalSheet;
}

export class ListsStore<T extends keyof ListsStoreData> {
    public data: ListsStoreData[T][] = [];

    constructor(data?: ListsStoreData[T][]) {
        if (!!data && !Array.isArray(data))
            throw new Error("data not from type array");

        this.data = data || [];
    }

    key() {
        return "";
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

    updateStore(sort?: boolean) {
        const store = PGApp.queryStore();

        const storeData = store.getData(this.key() as keyof ListsStoreData);
        if (storeData === undefined) {
            return;
        }

        const filteredData = storeData.filter((storeList: any) => {
            const data = this.data.find(
                (list) => this.listKey(list) === this.listKey(storeList),
            );

            return data === undefined;
        });

        const mergedData = [...filteredData, ...this.data];

        store.setData(
            this.key() as keyof ListsStoreData,
            (sort ? this.sort(mergedData as any[]) : mergedData) as any[],
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
        // TODO: Continue here...

        return list;
    }
}
