import { classed, span } from '@/html';

function rjust(n: any, w :number): string {
    return String(n).padStart(w, '\xa0');
}


function cell(
    target: HTMLElement,
    code: number | [number, number],
    desc: string,
    negative: boolean = false,
    colspan: number = 0
): void {
    const outer: HTMLElement = classed(target, colspan > 1 ? `col span-${colspan}` : "col");
    classed(outer, negative ? "neg" : null, "code").innerText = (
        rjust(Array.isArray(code) ? `${code[0]} - ${code[1]}` : code, 9)
    );
    span(outer, null, desc);
}


function row(target: HTMLElement, content: (e: HTMLElement) => void): void {
    content(classed(target, "row"));
}


export function sgr(target: HTMLElement): void {
    row(target, (r: HTMLElement): void => {
      classed(r, "col span-2");
        cell(r, 0, "Reset all", true);
    });
    row(target, (r: HTMLElement): void => {
        cell(r, 1, "Bold (or bright)");
        cell(r, 2, "Faint (or dim)");
        cell(r, 22, "Not bold or faint", true);
    });
    row(target, (r: HTMLElement): void => {
        cell(r, 3, "Italic", false, 2);
        cell(r, 23, "Not italic", true);
    });
    row(target, (r: HTMLElement): void => {
        cell(r, 4, "Underlined");
        cell(r, 21, "Doubly underlined");
        cell(r, 24, "Not underlined", true);
    });
    row(target, (r: HTMLElement): void => {
        cell(r, 5, "Slow blink");
        cell(r, 6, "Rapid blink");
        cell(r, 25, "Not blinking", true);
    });
    row(target, (r: HTMLElement): void => {
        cell(r, 8, "Concealed", false, 2);
        cell(r, 28, "Not concealed", true);
    });
    row(target, (r: HTMLElement): void => {
        cell(r, 9, "Crossed-out", false, 2);
        cell(r, 29, "Not crossed-out", true);
    });
    row(target, (r: HTMLElement): void => {
        cell(r, [11, 19], "Alternative font");
        cell(r, 20, "Fraktur font");
        cell(r, 10, "Default font", true);
    });
    row(target, (r: HTMLElement): void => {
        cell(r, 26, "Proportional spacing", false, 2);
        cell(r, 50, "Disable proportional spacing", true);
    });
    row(target, (r: HTMLElement): void => {
        cell(r, 51, "Framed");
        cell(r, 52, "Encircled");
        cell(r, 54, "Not framed or encircled", true);
    });
    row(target, (r: HTMLElement): void => {
        cell(r, 53, "Overlined", false, 2);
        cell(r, 55, "Not overlined", true);
    });
    row(target, (r: HTMLElement): void => {
        cell(r, 73, "Superscript");
        cell(r, 74, "Subscript");
        cell(r, 75, "Not superscript or subscript", true);
    });
    row(target, (r: HTMLElement): void => {
        cell(r, [30, 38], "Set text color");
        cell(r, [90, 97], "Set bright text color");
        cell(r, 39, "Default text color", true);
    });
    row(target, (r: HTMLElement): void => {
        cell(r, [40, 48], "Set background color");
        cell(r, [100, 107], "Set bright background color");
        cell(r, 49, "Default background color", true);
    });
    row(target, (r: HTMLElement): void => {
        cell(r, 58, "Set underline color", false, 2);
        cell(r, 59, "Default underline color", true);
    });
    row(target, (r: HTMLElement): void => {
        cell(r, 7, "Swap text and background colors", false, 3);
    });
}
