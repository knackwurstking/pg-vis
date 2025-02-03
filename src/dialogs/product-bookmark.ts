import * as globals from "../globals";
import * as types from "../types";
import * as query from "../utils-query";
import * as listStores from "../list-stores";

const html = String.raw;

function init(product: types.Product): Promise<null> {
    return new Promise((resolve, _reject) => {
        const dialog = query.dialog_ProductBookmark();

        dialog.close.onclick = () => dialog.root.close();
        dialog.root.onclose = () => resolve(null);
        dialog.title.innerText = product.lotto;

        const ls = listStores.get("vis-bookmarks");
        dialog.checkboxes.innerHTML = "";
        globals.store.get("vis-bookmarks")!.lists.forEach((bookmarks, index) => {
            const li = document.createElement("li");

            li.innerHTML = html`
                <label>
                    <input type="checkbox" value="${ls.listKey(bookmarks)}" />
                    ${bookmarks.title}
                </label>
            `;

            const input = li.querySelector<HTMLInputElement>(`input`)!;

            input.onchange = () => {
                globals.store.update("vis-bookmarks", (data) => {
                    if (input.checked) {
                        data.lists[index].data.push(product);
                    } else {
                        data.lists[index].data = data.lists[index].data.filter(
                            (p) => p.lotto !== product.lotto && p.name !== product.name,
                        );
                    }

                    return data;
                });
            };

            dialog.checkboxes.appendChild(li);

            for (const bookmarkedProduct of bookmarks.data) {
                if (
                    bookmarkedProduct.lotto === product.lotto &&
                    bookmarkedProduct.name === product.name
                ) {
                    input.checked = true;
                } else {
                    input.checked = false;
                }
            }
        });

        dialog.root.showModal();
    });
}

export default init;
