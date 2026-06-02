export type Array2D<T> = Array<Array<T>>;
export type Array3D<T> = Array<Array<Array<T>>>;
export type Array4D<T> = Array<Array<Array<Array<T>>>>;

export type Tuple1<T> = [T];
export type Tuple2<T> = [T, T];
export type Tuple3<T> = [T, T, T];
export type Tuple4<T> = [T, T, T, T];
export type Tuple5<T> = [T, T, T, T, T];
export type Tuple6<T> = [T, T, T, T, T, T];
export type Tuple7<T> = [T, T, T, T, T, T, T];
export type Tuple8<T> = [T, T, T, T, T, T, T, T];
export type Tuple9<T> = [T, T, T, T, T, T, T, T, T];
export type Tuple10<T> = [T, T, T, T, T, T, T, T, T, T];

export const E: [] = [];


export function tryParseInt(text: string, def: number = -1): number {
    const value: number = parseInt(text);
    return Number.isNaN(value) ? def : value;
}


type OptStr = string | null;
type OptElem = HTMLElement | null;
type OptClass = string | Array<string> | null;


export function $elem<T extends HTMLElement = HTMLElement>(
    parent?: OptElem,
    tagname?: OptStr,
    className?: OptClass,
    text?: OptStr
): T {
    const elem: HTMLElement = document.createElement(tagname ?? 'div');
    if (typeof className === 'string') {
        elem.className = className;
    } else if (Array.isArray(className)) {
        elem.className = className.join(' ');
    }
    if (text != null) {
        elem.innerText = text;
    }
    if (parent != null) {
        parent.appendChild(elem);
    }
    return elem as T;
}


export function $div(parent?: OptElem, className?: OptClass, text?: OptStr): HTMLDivElement {
    return $elem<HTMLDivElement>(parent, 'div', className, text);
}

export function $label(parent?: OptElem, className?: OptClass, text?: OptStr): HTMLLabelElement {
    return $elem<HTMLLabelElement>(parent, 'label', className, text);
}

export function $input(parent?: OptElem, className?: OptClass, text?: OptStr): HTMLInputElement {
    return $elem<HTMLInputElement>(parent, 'input', className, text);
}

export function $span(parent?: OptElem, className?: OptClass, text?: OptStr): HTMLSpanElement {
    return $elem<HTMLSpanElement>(parent, 'span', className, text);
}










