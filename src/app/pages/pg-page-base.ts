import { customElement } from "lit/decorators.js";
import { UIStackLayoutPage } from "ui";

@customElement("pg-page-base")
class PGPageBase<T> extends UIStackLayoutPage {
    name = "";

    protected data?: T;

    public async setData(data: T): Promise<void> {
        this.data = data;
    }
}

export default PGPageBase;
