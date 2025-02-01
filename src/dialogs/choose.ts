import * as query from "../utils-query";

function init(choices: string[]): Promise<string | null> {
    return new Promise((resolve, _reject) => {
        const dialog = query.dialog_Choose();

        let currentChoice: string | null = null;

        dialog.root.onclose = () => {
            resolve(currentChoice);
        };

        // Create dialog button for each choice
        dialog.choices.innerHTML = "";
        for (const choice of choices) {
            const button = document.createElement("button");

            button.value = choice;

            button.setAttribute("variant", "ghost");
            button.setAttribute("color", "secondary");

            button.onclick = () => {
                currentChoice = button.value;
                dialog.root.close();
            };

            dialog.choices.appendChild(button);
        }

        dialog.root.showModal();
    });
}

export default init;
