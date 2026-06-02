export function br(target: HTMLElement): void {
    target.appendChild(document.createElement("br"));
}


export function classed(
    target: HTMLElement,
    className: string | null,
    tagname: string = "div"
): HTMLElement {
    const elem: HTMLElement = document.createElement(tagname);
    if (className != null) {
        elem.className = className;
    }
    target.appendChild(elem);
    return elem;
}


export function txt(target: HTMLElement, text: string): void {
    target.appendChild(document.createTextNode(text));
}


export function span(target: HTMLElement, className: string | null, text: string): void {
    const span: HTMLElement = classed(target, className, "span");
    span.innerText = text;
}


export function heading(target: HTMLElement, level: number, text: string): void {
    const elem: HTMLElement = document.createElement(`h${level}`);
    elem.innerText = text;
    target.appendChild(elem);
}
