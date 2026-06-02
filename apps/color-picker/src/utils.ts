export type Optional<T> = T | null | undefined;

export type Tuple3<T> = [T, T, T];
export type Tuple4<T> = [T, T, T, T];

export function clamp(val: number, min: number = 0, max: number = 1): number {
    return Number.isNaN(val) || val <= min ? min : val >= max ? max : val;
}

export function wrap1(val: number): number {  // faster version of wrap(val, 0, 1)
    return Number.isNaN(val) ? 0 : val >= 0 ? val : 1 - (-val) % 1;
}

const HEX: string = '0123456789abcdef';

export function halfByte2hex(value: number): string {
    return HEX.charAt(value & 15);
}

export function byte2hex(value: number): string {
    return `${HEX.charAt((value >> 4) & 15)}${HEX.charAt(value & 15)}`;
}

export function f2Hex(value: number): string {
    return value <= 0 ? '00' : value >= 1 ? 'ff' : byte2hex(Math.round(value * 255));
}

function hexChar2Int(char: number): number {
    if (char >= 48 && char <= 57) {
        return char - 48;
    } else if (char >= 65 && char <= 70) {
        return char - 55;
    } else if (char >= 97 && char <= 102) {
        return char - 87;
    } else {
        return -1;
    }
}

export function readHex(str: string, start: number = 0, length: number = 1): number {
    let value: number = 0;
    for (let i: number = 0; i < length; ++i) {
        value = (value << 4) | hexChar2Int(str.charCodeAt(start + i));
    }
    return value;
}

export class CSS {

    static deg(value: number): string {
        return `${Math.round(wrap1(value) * 360)}deg`;
    }

    static percent(value: number): string {
        return `${Math.round(clamp(value) * 100)}%`;
    }

    static byte(value: number): string {
        return Math.round(clamp(value) * 255).toString();
    }
}

export const SVGNS: 'http://www.w3.org/2000/svg' = 'http://www.w3.org/2000/svg';

export function $svg(tagName: string): SVGElement {
    return document.createElementNS(SVGNS, tagName);
}

export function $svgPath(data: string): SVGPathElement {
    const element: SVGPathElement = document.createElementNS(SVGNS, 'path');
    element.setAttribute('d', data);
    return element;
}

export function noDrag<T extends Element>(element: T): void {
    element.addEventListener('dragstart', (event: Event): void => event.preventDefault());
}

export type Alignment = 'left' | 'center' | 'right';
