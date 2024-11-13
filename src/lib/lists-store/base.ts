import * as types from "../../types";

export interface ListsStoreData {
    alertLists: types.AlertList;
    metalSheets: types.MetalSheet;
    vis: types.Vis;
    visData: types.VisData;
    visBookmarks: types.Bookmarks;
}

export class ListsStore<T extends keyof ListsStoreData> {
    public key(): keyof ListsStoreData {
        return "" as keyof ListsStoreData;
    }

    public listKey(list: ListsStoreData[T]): string {
        if ("title" in list) return list.title as string;
        return "unknown";
    }

    public title(): string {
        return "";
    }

    public fileName(list: ListsStoreData[T]): string {
        return `${this.listKey(list)}.json`;
    }

    public zipFileName(): string {
        return `${this.title()} - ${new Date().getTime()}.zip`;
    }

    public validate(dataString: string): any | null {
        return JSON.parse(dataString);
    }

    public sort(data: ListsStoreData[T][]): ListsStoreData[T][] {
        const result: ListsStoreData[T][] = [];

        const keys = data.map((list) => `${this.listKey(list)}`).sort();

        for (const key of keys) {
            const keyData = data.find((list) => `${this.listKey(list)}` === key);
            if (keyData !== undefined) result.push(keyData);
        }

        return result;
    }

    /**
     * @throws exists error
     */
    public replaceInStore(
        store: types.PGStore,
        newList: ListsStoreData[T],
        oldList: ListsStoreData[T],
    ) {
        const newListKey = this.listKey(newList);
        const oldListKey = this.listKey(oldList);

        if (oldListKey !== newListKey) {
            for (const list of store.getData(this.key() as keyof ListsStoreData) || []) {
                if (this.listKey(list as any) === newListKey) {
                    throw new Error(`Liste "${newListKey}" existiert bereits!"`);
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

    /**
     * @throws exists error
     */
    public addToStore(store: types.PGStore, newData: ListsStoreData[T][], sort?: boolean) {
        const storeData = store.getData(this.key() as keyof ListsStoreData);
        if (storeData === undefined) {
            return;
        }

        for (const newList of newData) {
            const newListKey = this.listKey(newList as ListsStoreData[T]);
            const existingData = storeData.find((list) => {
                if (this.listKey(list as ListsStoreData[T]) === newListKey) {
                    return true;
                }

                return false;
            });

            if (existingData !== undefined) {
                throw new Error(`Liste "${newListKey}" existiert bereits!"`);
            }
        }

        const filteredData = storeData.filter((storeList) => {
            const data = newData.find(
                (list) => this.listKey(list) === this.listKey(storeList as ListsStoreData[T]),
            );

            return data === undefined;
        });

        const mergedData = [...filteredData, ...newData];

        store.setData(
            this.key() as keyof ListsStoreData,
            (sort ? this.sort(mergedData as ListsStoreData[T][]) : mergedData) as any[],
        );
    }
}
