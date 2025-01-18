import * as types from "@types";

export interface ListStoreData {
    alertLists: types.AlertList;
    metalSheets: types.MetalSheet;
    vis: types.Vis;
    visData: types.VisData;
    visBookmarks: types.Bookmarks;
    special: types.Special;
}

export class ListStore<T extends keyof ListStoreData> {
    public key(): keyof ListStoreData {
        return "" as keyof ListStoreData;
    }

    public listKey(list: ListStoreData[T]): string {
        if ("title" in list) return list.title as string;
        return "unknown";
    }

    public title(): string {
        return "";
    }

    public fileName(list: ListStoreData[T]): string {
        return `${this.listKey(list)}.json`;
    }

    public zipFileName(): string {
        return `${this.title()} - ${new Date().getTime()}.zip`;
    }

    public validate(dataString: string): any | null {
        try {
            return JSON.parse(dataString);
        } catch {
            return null;
        }
    }

    public sort(data: ListStoreData[T][]): ListStoreData[T][] {
        const result: ListStoreData[T][] = [];

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
        newList: ListStoreData[T],
        oldList: ListStoreData[T],
    ) {
        const newListKey = this.listKey(newList);
        const oldListKey = this.listKey(oldList);

        if (oldListKey !== newListKey) {
            for (const list of store.getData(this.key() as keyof ListStoreData) || []) {
                if (this.listKey(list as any) === newListKey) {
                    throw new Error(`Liste "${newListKey}" existiert bereits!"`);
                }
            }
        }

        store.updateData(this.key() as keyof ListStoreData, (data) => {
            for (let i = 0; i < data.length; i++) {
                if (this.listKey(data[i] as ListStoreData[T]) === oldListKey) {
                    data[i] = newList;
                }
            }

            return this.sort(data as ListStoreData[T][]) as any[];
        });
    }

    /**
     * @throws exists error
     */
    public addToStore(store: types.PGStore, newData: ListStoreData[T][]) {
        const storeData = store.getData(this.key() as keyof ListStoreData);
        if (storeData === undefined) {
            return;
        }

        for (const newList of newData) {
            const newListKey = this.listKey(newList as ListStoreData[T]);
            const existingData = storeData.find((list) => {
                if (this.listKey(list as ListStoreData[T]) === newListKey) {
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
                (list) => this.listKey(list) === this.listKey(storeList as ListStoreData[T]),
            );

            return data === undefined;
        });

        const mergedData = [...filteredData, ...newData];

        store.setData(
            this.key() as keyof ListStoreData,
            this.sort(mergedData as ListStoreData[T][]) as any[],
        );
    }
}
