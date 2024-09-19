import { PushDialog } from "../components";

/**
 * @template {any} T
 */
export class Gist {
  /**
   * @param {string} id
   * @param {string | null} [token] - Token for writing to gist repo
   */
  constructor(id, token = null) {
    /**
     * @type {string}
     */
    this.id = id;

    /**
     * @type {string | null}
     */
    this.token = token;

    /**
     * @type {Gist_Data<T> | null}
     */
    this.data = null;
  }

  /**
   * @returns  {Promise<Gist_Data<T> | null>}
   */
  async get() {
    if (!this.id) return null;

    // Get data from github gist
    const url = `https://api.github.com/gists/${this.id}`;

    const request = await fetch(url);

    if (!request.ok) {
      throw `request to "${url}" failed with "${request.status}"!`;
    }

    // Parse JSON and content
    const data = await request.json();
    this.data = {
      revision: data.history.length,
      files: {},
      owner: {
        login: data.owner.login,
      },
    };
    for (const [k, v] of Object.entries(data.files)) {
      this.data.files[k] = {
        filename: v.filename,
        content: JSON.parse(v.content),
      };
    }

    return this.data;
  }

  /**
   * @param {Gist_PatchFiles} files
   * @returns {Promise<Gist_Patch | null>} Returns null no success
   */
  async patch(files) {
    if (!this.id || this.token === null) return null;

    const url = `https://api.github.com/gists/${this.id}`;
    const request = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ files: files }),
    });

    if (!request.ok) {
      throw `${request.status}`;
    }

    /** @type {Gist_Patch} */
    const data = await request.json();

    return data;
  }
}

/**
 * @template {any} T
 * @param {string} gistID
 * @param {number} rev
 * @param {Object} options
 * @param {(() => Promise<void>) | null} [options.beforeUpdate]
 * @param {((data: T) => void|Promise<void>)} options.update
 * @returns {Promise<number>} returns the new revision
 */
export async function gistPull(gistID, rev, { beforeUpdate = null, update }) {
  /**
   * @type {Gist<T>}
   */
  const gist = new Gist(gistID);
  const data = await gist.get();

  let allow = false;

  if (data.revision > rev) {
    allow = confirm(`Upgrade auf Revision "${data.revision}"`);
  } else if (data.revision < rev) {
    allow = confirm(`Downgrade auf Revision "${data.revision}"`);
  } else {
    // Already up to date! Reload? (revision: ${data.revision})
    allow = confirm(
      `Schon auf dem neuesten Stand! Neu laden? (Revision: ${data.revision})`,
    );
  }

  if (allow) {
    if (typeof beforeUpdate === "function") {
      await beforeUpdate();
    }

    Object.values(data.files).forEach((file) => update(file.content));
    return data.revision;
  }
}

/**
 * @template {Object} T
 * @param {string} gistID
 * @param {number} rev
 * @param {T[]} lists
 * @param {Object} options
 * @param {(list: T) => string} options.getFileName
 * @returns {Promise<number>} returns the new revision
 */
export function gistPush(gistID, rev, lists, { getFileName }) {
  return new Promise((resolve, reject) => {
    const dialog = new PushDialog();

    dialog.ui.events.on("close", () => {
      document.body.removeChild(dialog);
    });

    dialog.ui.events.on("submit", async (token) => {
      /**
       * @type {Gist<T>}
       */
      const gist = new Gist(gistID, token);
      const data = await gist.get();
      if (data.revision > rev) {
        // Local revision is too old (revision: "${rev}"), revision "${data.revision}" needed
        return reject(
          new Error(
            `Lokale Revision ist zu alt (Revision: "${rev}"), Revision "${data.revision}" erforderlich`,
          ),
        );
      }

      const jsonOnline = Object.values(data.files)
        .map((file) => {
          return JSON.stringify(file.content);
        })
        .sort();

      const jsonLocal = Object.values(lists)
        .map((list) => {
          return JSON.stringify(list);
        })
        .sort();

      if (JSON.stringify(jsonOnline) === JSON.stringify(jsonLocal)) {
        // Gist repo already up-to-date
        return reject(new Error(`Gist-Repo bereits auf dem neuesten Stand`));
      }

      /**
       * @type {Gist_PatchFiles}
       */
      const patchData = {};
      lists.forEach((list) => {
        patchData[getFileName(list)] = {
          content: JSON.stringify(list),
        };
      });

      for (const k of Object.keys(data.files)) {
        if (!Object.hasOwn(patchData, k)) {
          patchData[k] = null;
        }
      }

      try {
        console.table(await gist.patch(patchData));
      } catch (err) {
        // Patching failed: ${err}
        return reject(new Error(`Update fehlgeschlagen:\n\"${err}\"`));
      }

      return resolve(rev + 1);
    });

    document.body.appendChild(dialog);
    dialog.ui.open(true);
  });
}
