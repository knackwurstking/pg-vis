import PGApp from "../app/pg-app";
import { AlertList } from "../types";

export interface ListsStoreData {
    alertLists: AlertList;
}

export class ListsStore<T extends keyof ListsStoreData> {
    public data: ListsStoreData[T][] = [];

    constructor(data?: ListsStoreData[T][]) {
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

    validate(data: any): ListsStoreData[T][] | null {
        return data;
    }

    // TODO: ...

    updateStore() {}
}

export class AlertListsStore extends ListsStore<"alertLists"> {
    key(): keyof ListsStoreData {
        return "alertList" as keyof ListsStoreData;
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

    validate(data: any): AlertList[] | null {
        if (typeof data?.title !== "string") return null;
        if (!("data" in data)) return null;
        if (!Array.isArray(data.data)) return null;

        for (const part of data.data) {
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

        return data;
    }

    updateStore() {
        const store = PGApp.queryStore();

        const storeData = store.getData(this.key());
        if (storeData === undefined) {
            return;
        }

        const data = storeData.map((storeList) => {
            return (
                this.data.find(
                    (list) => this.listKey(list) === this.listKey(storeList),
                ) || storeList
            );
        });

        store.setData(this.key(), data);
    }
}
