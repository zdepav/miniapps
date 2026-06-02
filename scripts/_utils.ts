import path from 'node:path';


/** Root project directory */
export const ROOTD: string = path.resolve(import.meta.dirname, '..');


/** Root directory for files compiled in release mode */
export const DIST_DIR: string = path.join(ROOTD, 'dist');


/** Root directory for files compiled in development mode */
export const OUT_DIR: string = path.join(ROOTD, '.out');


/** Root directory for common assets */
export const ASSETS_DIR: string = path.join(ROOTD, 'assets');


/** Root directory for app projects */
export const APPS_DIR: string = path.join(ROOTD, 'apps');


/** Regular expression for splitting text into words
 * @see {@link wordWrapIterLine}
 * @see {@link wordWrapIter}
 * @see {@link wordWrapPrint}
 */
const WHITESPACE_REGEX: RegExp = /\s+/g;


/** Regular expression for splitting text into lines
 * @see {@link wordWrapIterLine}
 * @see {@link wordWrapIter}
 * @see {@link wordWrapPrint}
 */
const NEWLINE_REGEX: RegExp = /\r\n?|[\n\v\f\x85\u2028\u2029]/g;


/** Split (word-wrap) single-line text into 1 or more lines
 * @param text line to word-wrap
 * @param indent indentation
 * @param lineWidth maximum line length
 * @returns generator yielding individual lines (without line breaks)
 */
function* wordWrapIterLine(text: string, indent: string, lineWidth: number): Generator<string> {
    const words: Array<string> = text.trim().split(WHITESPACE_REGEX);
    if (words[0].length == 0) {
        yield ''; // text is empty or whitespace only -> blank line
        return;
    }
    let line: Array<string> = [];
    let lineLength: number = indent.length;
    for (let i: number = 0; i < words.length;){
        const word: string = words[i];
        if (line.length == 0) {
            line.push(word);
            lineLength += word.length;
            ++i;
        } else if (lineLength + 1 + word.length > lineWidth) {
            yield indent + line.join(' ');
            line.length = 0;
            lineLength = indent.length;
        } else {
            line.push(word);
            lineLength += 1 + word.length;
            ++i;
        }
    }
    if (line.length > 0) {
        yield indent + line.join(' ');
    }
}


/** Split (word-wrap) text into lines, keeping existing line breaks
 * @param text text to word-wrap
 * @param indent indentation, either as a string or a number of spaces
 * @param lineWidth maximum line length, defaults to 80 characters
 * @returns generator yielding individual lines (without line breaks)
 */
export function* wordWrapIter(
    text: string,
    indent: string | number = '',
    lineWidth: number = 80
): Generator<string> {
    if (typeof indent == 'number') {
        indent = ' '.repeat(indent);
    }
    for (const line of text.split(NEWLINE_REGEX)) {
        yield* wordWrapIterLine(line, indent, lineWidth);
    }
}

/** Print a word-wrapped text to the console
 * @param print function to use for printing (usually {@link console.log} or {@link console.error})
 * @param text text to print
 * @param indent indentation, either as a string or a number of spaces
 * @param lineWidth maximum line length, defaults to 80 characters
 */
export function wordWrapPrint(
    print: (s?: string) => void,
    text: string,
    indent: string | number = '',
    lineWidth: number = 80
): void {
    for (const line of wordWrapIter(text, indent, lineWidth)) {
        print(line);
    }
}


/** Capitalized english month names */
export const MONTHS: ReadonlyArray<string> = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];


/** Format a date as a string (english, no time)
 * @param date date to format
 * @returns formatted date string
 */
export function formatDate(date: Date): string {
    return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}


/** Terminal color codes for use in console output */
export interface TerminalColors {

    /** Red */
    R: string;

    /** Green */
    G: string;

    /** Blue */
    B: string;

    /** Yellow */
    Y: string;

    /** Magenta */
    M: string;

    /** Cyan */
    C: string;

    /** Reset */
    x: string;
}


/** Get terminal color codes if output is a TTY, empty strings otherwise
 * @param forceEnable if true, forces color output even if stdout is not a TTY
 * @param forceDisable if true, disables color output even if stdout is a TTY
 * @remarks forceDisable takes precedence over forceEnable
 * @returns terminal color codes or empty strings
 */
export function getTerminalColors(forceEnable: boolean, forceDisable: boolean): TerminalColors {
    if (forceDisable || (!process.stdout.isTTY && !forceEnable)) {
        return { R: '', G: '', B: '', Y: '', M: '', C: '', x: '' };
    }
    return {
        R: '\x1b[31m', G: '\x1b[32m', B: '\x1b[34m',
        Y: '\x1b[33m', M: '\x1b[35m', C: '\x1b[36m',
        x: '\x1b[0m'
    };
}
