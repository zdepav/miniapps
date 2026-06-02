import Switcher from '@/Switcher';
import { span, br, classed, txt } from '@/html';

interface Command {
    code: string;
    name: string;
}


function codeComment(target: HTMLElement, start: string, text: string): void {
    span(target, "comment", `\xa0\xa0${start}\xa0${text}`);
}


function codePrintfFormat(target: HTMLElement, argc:number, code: string): void {
    span(target, "esc", "\\x1b[");
    for (let i: number = 0; i < argc; ++i) {
        if (i > 0) {
            span(target, "esc", ";");
        }
        span(target, "arg", "%d");
    }
    span(target, "esc", code);
}


function codeC(target: HTMLElement, args: Array<string>, cmd: Command, notFirst?: boolean): void {
    if (notFirst) {
        br(target);
    }
    txt(target, 'printf("');
    codePrintfFormat(target, args.length, cmd.code);
    txt(target, '"');
    for (const arg of args) {
        txt(target, ",\xa0");
        span(target, "arg", arg);
    }
    txt(target, ");");
    codeComment(target, "//", cmd.name);

}


function codeSh(target: HTMLElement, args: Array<string>, cmd: Command, notFirst?: boolean): void {
    if (notFirst) {
        br(target);
    }
    txt(target, "printf '");
    codePrintfFormat(target, args.length, cmd.code);
    txt(target, "'");
    for (const arg of args) {
        txt(target, "\xa0$");
        span(target, "arg", arg);
    }
    codeComment(target, "#", cmd.name);
}


function codePy(target: HTMLElement, args: Array<string>, cmd: Command, notFirst?: boolean): void {
    if (notFirst) {
        br(target);
    }
    txt(target, "printf(f'");
    span(target, "esc", "\\x1b[");
    for (let i: number = 0; i < args.length; ++i) {
        if (i > 0) {
            span(target, "esc", ";");
        }
        txt(target, "{");
        span(target, "arg", args[i]);
        txt(target, "}");
    }
    span(target, "esc", cmd.code);
    txt(target, "', end='')");
    codeComment(target, "#", cmd.name);
}


function codeAll(
    target: HTMLElement,
    args: Array<string>,
    cmds: Array<Command>,
    desc: (elem: HTMLElement) => void
): void {
    const container: HTMLElement = classed(target, "switchable-code");
    let codeElement: HTMLElement = classed(container, "lang-c", "code");
    Switcher.switchable("lang", "c", codeElement);
    for (let i: number = 0; i < cmds.length; ++i) {
        codeC(codeElement, args, cmds[i], i > 0);
    }
    codeElement = classed(container, "lang-sh", "code");
    Switcher.switchable("lang", "sh", codeElement);
    for (let i: number = 0; i < cmds.length; ++i) {
        codeSh(codeElement, args, cmds[i], i > 0);
    }
    codeElement = classed(container, "lang-py", "code");
    Switcher.switchable("lang", "py", codeElement);
    for (let i: number = 0; i < cmds.length; ++i) {
        codePy(codeElement, args, cmds[i], i > 0);
    }
    desc(classed(target, "desc"));
}


function columns(target: HTMLElement, contents: Array<(elem: HTMLElement) => void>): void {
    const columnElement: HTMLElement = classed(target, "columns");
    for (const column of contents) {
        column(classed(columnElement, "column"));
    }
}

export function commands(container: HTMLElement): void {
    columns(container, [
        (column: HTMLElement): void => {
            codeAll(column, ["distance"], [
                { code: "A", name: "Cursor Up" },
                { code: "B", name: "Cursor Down" },
                { code: "C", name: "Cursor Forward" },
                { code: "D", name: "Cursor Back" }
            ], (desc: HTMLElement): void => {
                txt(desc, "Moves the cursor ");
                span(desc, "arg", "distance");
                txt(desc, " (defaults to 1) cells in the given direction.");
                br(desc);
                txt(desc,
                    "If the cursor is already at the edge of the screen, this has no effect."
                );
            });
            codeAll(column, ["lines"], [
                { code: "E", name: "Next Line" },
                { code: "F", name: "Previous Line" }
            ], (desc: HTMLElement): void => {
                txt(desc, "Moves the cursor to the beginning of the line ");
                span(desc, "arg", "lines");
                txt(desc, " (defaults to 1) up or down.");
            });
            codeAll(column, ["column"], [
                { code: "G", name: "Cursor Horizontal Position" }
            ], (desc: HTMLElement): void => {
                txt(desc, "Moves the cursor to the given ");
                span(desc, "arg", "column");
                txt(desc, " (defaults to 1).");
            });
            codeAll(column, ["row", "column"], [
                { code: "H", name: "Cursor Position" }
            ], (desc: HTMLElement): void => {
                txt(desc, "Moves the cursor to the given ");
                span(desc, "arg", "row");
                txt(desc, " and ");
                span(desc, "arg", "column");
                txt(desc, " (both default to 1).");
            });
        },
        (column: HTMLElement): void => {
            codeAll(column, ["mode"], [
                { code: "J", name: "Erase in Display" }
            ], (desc: HTMLElement): void => {
                txt(desc, "Clears part of the screen.");
                br(desc);
                txt(desc, "If ");
                span(desc, "arg", "mode");
                txt(desc, " is 0 (default), clears from the cursor to the end of the screen.");
                br(desc);
                txt(desc, "If ");
                span(desc, "arg", "mode");
                txt(desc, " is 1, clears from the cursor to the beginning of the screen.");
                br(desc);
                txt(desc, "If ");
                span(desc, "arg", "mode");
                txt(desc, " is 2, clears the entire screen.");
                br(desc);
                txt(desc, "If ");
                span(desc, "arg", "mode");
                txt(desc,
                    " is 3, clears the entire screen and deletes all lines saved in the scrollback"
                    + " buffer."
                );
                br(desc);
                txt(desc, "Might not move the cursor.");
            });
            codeAll(column, ["mode"], [
                { code: "K", name: "Erase in Line" }
            ], (desc: HTMLElement): void => {
                txt(desc, "Erases part of the current line.");
                br(desc);
                txt(desc, "If ");
                span(desc, "arg", "mode");
                txt(desc, " is 0 (default), clears from the cursor to the end of the line.");
                br(desc);
                txt(desc, "If ");
                span(desc, "arg", "mode");
                txt(desc, " is 1, clears from the cursor to the beginning of the line.");
                br(desc);
                txt(desc, "If ");
                span(desc, "arg", "mode");
                txt(desc, " is 2, clears the entire line.");
                br(desc);
                txt(desc, "Does not move the cursor.");
            });
            codeAll(column, ["lines"], [
                { code: "S", name: "Scroll Up" },
                { code: "T", name: "Scroll Down" }
            ], (desc: HTMLElement): void => {
                txt(desc, "Scrolls by ");
                span(desc, "arg", "lines");
                txt(desc, " up or down.");
            });
        }
    ]);
    columns(container, [
        (column: HTMLElement): void => {
            codeAll(column, ["arguments"], [
                { code: "m", name: "Select Graphic Rendition" }
            ], (desc: HTMLElement): void => {
                txt(desc, "Sets display attributes.");
                br(desc);
                txt(desc,
                    "Several attributes can be set in the same sequence, separated by"
                    + " semicolons. Each display attribute remains in effect until a following"
                    + " occurrence of SGR resets it."
                );
                br(desc);
                txt(desc, "If no codes are given, all attributes are reset.");
            });
        }
    ]);
}