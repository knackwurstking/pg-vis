interface Gist_Data<T> {
  revision: number;
  files: {
    [key: string]: {
      filename: string;
      content: T;
    };
  };
  owner: {
    login: string;
  };
}

interface Gist_Patch {
  message: string;
  status: string;
}

interface Gist_PatchFiles {
  [key: string]: {
    content: string;
  };
}
