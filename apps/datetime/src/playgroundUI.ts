import { buildCodeSamples } from "@/codes";


const INPUTS: Record<string, HTMLInputElement | HTMLSelectElement> = {};
const BUTTONS: Record<string, HTMLButtonElement> = {};

function textbox(
    parent: HTMLElement,
    id: string,
    title: string,
    width?: number,
    pattern?: string
): HTMLInputElement {
    const input: HTMLInputElement = document.createElement("input");
    input.title = title;
    input.type = "text";
    if (width != null) {
        input.classList.add(`in${width}`);
    }
    if (width != null && pattern == null) {
        input.pattern = "[0-9]{1,2}";
    } else if (pattern != null) {
        input.pattern = pattern;
    }
    input.autocomplete = "off";
    parent.appendChild(input);
    INPUTS[id] = input;
    return input;
}


function button(parent: HTMLElement, id: string, text: string, title: string): HTMLButtonElement {
    const button: HTMLButtonElement = document.createElement("button");
    button.title = title;
    button.innerText = text;
    button.type = "button";
    parent.appendChild(button);
    BUTTONS[id] = button;
    return button;
}


function sep(parent: HTMLElement, text: string): HTMLSpanElement {
    const span: HTMLSpanElement = document.createElement("span");
    span.className = "sep";
    span.innerText = text;
    parent.appendChild(span);
    return span;
}


function inputSet(
    parent: HTMLElement,
    label: string,
    multipart: boolean,
    content: (elem: HTMLElement) => void
): HTMLLabelElement {
    const labelElement: HTMLLabelElement = document.createElement("label");
    const span: HTMLSpanElement = document.createElement("span");
    span.className = "label";
    span.innerText = label;
    labelElement.appendChild(span);
    if (multipart) {
        const contentElement: HTMLElement = document.createElement("div");
        contentElement.className = "multipart-input";
        content(contentElement);
        labelElement.appendChild(contentElement);
    } else {
        content(labelElement);
    }
    parent.appendChild(labelElement);
    return labelElement;
}


function flexBr(parent: HTMLElement): void {
    const elem: HTMLDivElement = document.createElement("div");
    elem.className = "flex-br";
    parent.appendChild(elem);
}


function select(
    parent: HTMLElement,
    id: string,
    title: string,
    options: Array<[string, string]>
): HTMLSelectElement {
    const input: HTMLSelectElement = document.createElement("select");
    input.title = title;
    input.autocomplete = "off";
    for (const [value, text] of options) {
        input.options.add(new Option(text, value));
    }
    input.selectedIndex = 0;
    parent.appendChild(input);
    INPUTS[id] = input;
    return input;
}


function escapeShellString(str: string): string {
    return `'${str.replace(/'+/g, (m: string): string => `'"${m}"'`)}'`
}


function escapeCString(str: string): string {
    let buffer: string = '"';
    for (let i: number = 0; i < str.length; ++i) {
        const char: string = str.charAt(i);
        if (char == '"' || char == '\\') {
            buffer += '\\';
        }
        buffer += char;
    }
    return buffer + '"';
}


export class IO {
    private readonly output: HTMLElement;
    private readonly outputBlock: HTMLElement;
    private readonly codeElements: Map<string, HTMLElement>;
    private readonly formatStrElements: Map<string, HTMLElement>;
    private readonly tzdetail: Array<HTMLElement>;
    private readonly titleCache: Map<string, string>;

    constructor(
        output: HTMLElement,
        outputBlock: HTMLElement,
        codeElements: Array<[string, HTMLElement, HTMLElement]>,
        tzdetail: Array<HTMLElement>
    ) {
        this.output = output;
        this.outputBlock = outputBlock;
        this.codeElements = new Map();
        this.formatStrElements = new Map();
        this.tzdetail = tzdetail;
        this.titleCache = new Map();
        for (const [lang, fmsElem, codeElem] of codeElements) {
            this.formatStrElements.set(lang, fmsElem);
            this.codeElements.set(lang, codeElem);
        }
    }

    private input(id: string): HTMLSelectElement | HTMLInputElement {
        if (id in INPUTS) {
            return INPUTS[id];
        }
        throw new Error(`Input with id "${id}" does not exist`);
    }

    private button(id: string): HTMLButtonElement {
        if (id in BUTTONS) {
            return BUTTONS[id];
        }
        throw new Error(`Button with id "${id}" does not exist`);
    }

    setOutput(text: string): void {
        this.output.classList.remove("invalid");
        this.output.innerText = text;
    }

    setErrorOutput(error: string): void {
        this.output.classList.add("invalid");
        this.output.innerText = error;
    }

    toggleOutput(enabled: boolean): void {
        this.outputBlock.classList.toggle("hidden", !enabled);
    }

    setLanguage(lang: string): void {
        for (const [elang, elem] of this.codeElements.entries()) {
            elem.classList.toggle("hidden", elang !== lang);
        }
    }

    setFormatString(lang: string, fmt: string): void {
        const elem: HTMLElement | undefined = this.formatStrElements.get(lang);
        if (elem == null) {
            throw new Error(`Unrecognized language ID "${lang}"`);
        }
        if (lang === "shP" || lang === "shG") {
            elem.innerText = escapeShellString(fmt);
        } else {
            elem.innerText = escapeCString(fmt);
        }
    }

    toggleButton(id: string, enabled: boolean, title?: string | null): void {
        const button: HTMLButtonElement = this.button(id);
        button.disabled = !enabled;
        button.classList.toggle("disabled", !enabled);
        if (title == null) {
            if (this.titleCache.has(id)) {
                button.title = this.titleCache.get(id)!;
                this.titleCache.delete(id);
            }
        } else if (this.titleCache.has(id)) {
            button.title = title;
        } else {
            this.titleCache.set(id, button.title);
            button.title = title;
        }
    }

    toggleTzDetail(enabled: boolean): void {
        for (const element of this.tzdetail) {
            element.classList.toggle("hidden", !enabled);
        }
    }

    onButton(id: string, handler: () => void): void {
        const button: HTMLButtonElement = this.button(id);
        button.addEventListener("click", (): void => {
            if (!button.disabled) {
                handler();
            }
        });
    }

    getInput(id: string): string { return this.input(id).value; }

    setInput(id: string, value: string): void { this.input(id).value = value; }

    onInput(id: string, handler: (value: string) => void): void {
        const input: HTMLInputElement | HTMLSelectElement = this.input(id);
        input.addEventListener("input", (): void => handler(input.value));
    }
}


export function buildPlaygroundUI(parent: HTMLElement): IO {
    const container: HTMLDivElement = document.createElement('div');
    container.id = 'ma-datetime-playground-container';
    const playground: HTMLDivElement = document.createElement('div');
    playground.id = 'ma-datetime-playground';
    inputSet(playground, "Date", true, (group: HTMLElement): void => {
        textbox(group, "year", "Year", 4, '[2-9][0-9]{2,4}|1[0-9]{1,3}[1-9]'); // 101 - 99999
        sep(group, "/");
        textbox(group, "month", "Month", 2);
        sep(group, "/");
        textbox(group, "day", "Day", 2);
    });
    inputSet(playground, "Time", true, (group: HTMLElement): void => {
        textbox(group, "hour", "Hour", 2)
        sep(group, ":");
        textbox(group, "minute", "Minute", 2)
        sep(group, ":");
        textbox(group, "second", "Second", 2)
        sep(group, ".");
        textbox(group, "nanos", "Nanosecond", 9, '[0-9]{1,9}')
    });
    const tzdetail: Array<HTMLElement> = [];
    inputSet(playground, "Timezone", true, (group: HTMLElement): void => {
        select(group, "tzdir", "Timezone offset", [
            ["+", "\xa0+\xa0"], ["-", "\xa0-\xa0"], ["Z", "\xa0Z\xa0"]
        ]).classList.add("in2");
        tzdetail.push(textbox(group, "tzhour", "Timezone hour", 2));
        tzdetail.push(sep(group, ":"));
        tzdetail.push(textbox(group, "tzminute", "Timezone minute", 2));
    });
    button(playground, "set-now", "Now", "Set date and time to current");
    button(playground, "set-y2k", "Y2K", "Set date and time to beginning of the year 2000 in UTC");
    flexBr(playground);
    inputSet(playground, "Mode", false, (group: HTMLElement): void => {
        select(group, "lang", "Target language", [
            ["py", "Python"],
            ["shP", "Shell (Posix)"],
            ["shG", "Shell (GNU)"],
            ["cs", "C#"],
            ["j7", "Java 7"],
            ["j8", "Java 8+"],
            ["jsL", "JavaScript (Luxon)"]
        ]);
    });
    inputSet(playground, "Format", false, (group: HTMLElement): void => {
        group.classList.add("expand");
        textbox(group, "format", "Formatting string");
    });
    button(playground, "reset", "Reset", "Reset formatting string to default");
    button(playground, "apply", "Test", "Write formatted date to output");
    flexBr(playground);
    const output: HTMLElement = document.createElement("pre");
    const outputBlock: HTMLElement = inputSet(
        playground,
        "Formatted date (using en-US locale)",
        false,
        (group: HTMLElement): void => {
            group.classList.add("expand");
            output.id = "ma-datetime-output";
            output.innerText = "\xa0";
            group.appendChild(output);
        }
    );
    flexBr(playground);
    let codeElements: Array<[string, HTMLElement, HTMLElement]>;
    inputSet(playground, "Code example", false, (group: HTMLElement): void => {
        group.classList.add("expand");
        codeElements = buildCodeSamples(group);
    });
    container.appendChild(playground);
    parent.appendChild(container);
    return new IO(output, outputBlock, codeElements!, tzdetail);
}
