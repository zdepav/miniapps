import { span } from './html';

export default class Switcher {

    private static switchables: Map<string, Map<string, Array<HTMLElement>>> = new Map();

    static switchable(group: string, id: string, element: HTMLElement): void {
        let byId: Map<string, Array<HTMLElement>> | undefined = Switcher.switchables.get(group);
        if (byId == null) {
            byId = new Map();
            Switcher.switchables.set(group, byId);
        }
        let elements: Array<HTMLElement> | undefined = byId.get(id);
        if (elements != null) {
            elements.push(element);
        } else {
            byId.set(id, [element]);
        }
    }

    private readonly group: string;
    private readonly options: Record<string, string>;
    private defaultOption: string | null;

    constructor(group: string) {
        this.group = group;
        this.options = {};
        this.defaultOption = null;
    }

    option(id: string, title: string): void {
        this.options[id] = title;
        if (this.defaultOption == null) {
            this.defaultOption = id;
        }
    }

    private select(checked: boolean, id: string): void {
        if (!checked) {
            return;
        }
        Switcher.switchables.get(this.group)?.forEach(
            (elements: Array<HTMLElement>, key: string): void => {
                for (const e of elements) {
                    e.classList.toggle("hidden", key !== id);
                }
            }
        )
    }

    build(container: HTMLElement): void {
        if (this.defaultOption == null) {
            throw new Error(`"${this.group}" switcher has no options`);
        }
        const select: HTMLElement = document.createElement("div");
        select.classList.add("select");
        container.appendChild(select);
        for (const id of Object.keys(this.options).sort()) {
            const label: HTMLElement = document.createElement("label");
            const input: HTMLInputElement = document.createElement("input");
            input.type = "radio";
            input.name = this.group;
            input.value = id;
            input.checked = id === this.defaultOption;
            input.autocomplete = "off";
            input.addEventListener("change", (): void => this.select(input.checked, id));
            label.appendChild(input);
            span(label, null, this.options[id]);
            select.appendChild(label);
        }
    }

    init(): void {
        if (this.defaultOption == null) {
            throw new Error(`"${this.group}" switcher has no options`);
        }
        this.select(true, this.defaultOption);
    }
}
