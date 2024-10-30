export interface GistData<T extends any> {
    revision: number;
    owner: {
        login: string;
    };
    files: {
        [key: string]: {
            filename: string;
            content: T;
        };
    };
}

export class Gist {
    public id: string;

    constructor(id: string) {
        this.id = id;
    }

    async get<T extends any>(): Promise<GistData<T>> {
        const url = `https://api.github.com/gists/${this.id}`;
        const req = await fetch(url);

        if (!req.ok) {
            throw `request to "${url}" failed with "${req.status}"!`;
        }

        const data = await req.json();

        const files: {
            [key: string]: {
                filename: string;
                content: T;
            };
        } = {};

        Object.entries(data.files).forEach(([k, v]) => {
            files[k] = {
                filename: (v as any).filename as string,
                content: JSON.parse((v as any).content as string),
            };
        });

        return {
            revision: data.history.length,
            files: files,
            owner: {
                login: data.owner.login,
            },
        };
    }
}
