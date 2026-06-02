export function pad(
    value: number | string,
    width: number,
    forceSign: boolean = false,
    padChar: string = "0"
): string {
    let str: string = value.toString();
    if (forceSign && !str.startsWith("-")) {
        str = "+" + str;
    }
    return str.padStart(width, padChar);
}


export function parseIntRange(value: string, min: number, max: number): number {
    const val: number = parseInt(value);
    if (isNaN(val) || val < min || val > max) {
        throw new Error();
    }
    return val;
}
