/**
 * @param {File_ImportCB} cb
 */
export function load(cb) {
  const input = document.createElement("input");

  input.type = "file";
  input.multiple = true;

  /**
   * @param {Event & { currentTarget: HTMLInputElement }} ev
   */
  input.onchange = async (ev) => {
    for (const file of ev.currentTarget.files) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== "string") return;

        try {
          cb(reader.result, file);
        } catch (err) {
          // Validation failed: ${err}
          alert(`Datenanalyse fehlgeschlagen: "${err}"`);
        }
      };
      reader.onerror = () => {
        // Read file "${file.name}" failed!
        alert(`Lesen der Datei "${file.name}" ist fehlgeschlagen!`);
      };
      reader.readAsText(file);
    }
  };

  input.click();
}
