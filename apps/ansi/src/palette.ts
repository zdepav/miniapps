import { classed, txt } from "@/html";
import Switcher from "@/Switcher";

const HEX: string = "0123456789abcdef";


function hex(val: number): string {
    return `${HEX[Math.floor(val / 16 % 16)]}${HEX[val % 16]}`;
}


function cell(target: HTMLElement, i: number, r: number, g: number, b: number): void {
  const elem: HTMLElement = classed(target, "cell");
  elem.style.backgroundColor = `#${hex(r)}${hex(g)}${hex(b)}`;
  if (r * 0.3 + g * 0.59 + b * 0.1 < 120) {
      elem.style.color = "#fff";
  }
  if (i < 16 && i % 2 === 1) {
      elem.style.paddingRight = "1px";
  }
  elem.innerText = String(i);
}


function terminal(target: HTMLElement, id: string, colors: number[]): void {
    const row: HTMLElement = classed(target, "row basic");
    Switcher.switchable("term", id, row);
    for (let i: number = 0; i < 16; ++i) {
        cell(row, i, colors[i] >> 16, (colors[i] >> 8) & 255, colors[i] & 255);
    }
}


export function palette(target: HTMLElement): void {
    terminal(target, "win", [
        0x000000, 0x800000, 0x008000, 0x808000, 0x000080, 0x800080, 0x008080, 0xc0c0c0,
        0x808080, 0xff0000, 0x00ff00, 0xffff00, 0x0000ff, 0xff00ff, 0x00ffff, 0xffffff
    ]);
    terminal(target, "terminal", [
        0x0c0c0c, 0xc50f1f, 0x13a10e, 0xc19c00, 0x0037da, 0x881798, 0x3a96dd, 0xcccccc,
        0x767676, 0xe74856, 0x16c60c, 0xf9f1a5, 0x3b78ff, 0xb4009e, 0x61d6d6, 0xf2f2f2
    ]);
    terminal(target, "powershell", [
        0x000000, 0x800000, 0x008000, 0xeeedf0, 0x000080, 0x012456, 0x008080, 0xc0c0c0,
        0x808080, 0xff0000, 0x00ff00, 0xffff00, 0x0000ff, 0xff00ff, 0x00ffff, 0xffffff
    ]);
    terminal(target, "putty", [
        0x000000, 0xd42c3a, 0x1ca800, 0xc0a000, 0x005dff, 0xb148c6, 0x00a89a, 0xbfbfbf,
        0x606060, 0xff7676, 0x00f200, 0xf2f200, 0x7d97ff, 0xff70ff, 0x00f0f0, 0xffffff
    ]);
    terminal(target, "vscode", [
        0x181818, 0xcd3131, 0x0dbc79, 0xe5e510, 0x2472c8, 0xbc3fbc, 0x11a8cd, 0xe5e5e5,
        0x666666, 0xf14c4c, 0x23d18b, 0xf5f543, 0x3b8eea, 0xd670d6, 0x29b8db, 0xe5e5e5
    ]);
    // terminal(target, "jetbrains-old", [
    //     0x000000, 0xf0524f, 0x5c962c, 0xa68a0d, 0x3993d4, 0xa771bf, 0x00a3a3, 0x808080,
    //     0x595959, 0xff4050, 0x4fc414, 0xe5bf00, 0x1fb0ff, 0xed7eed, 0x00e5e5, 0xffffff
    // ]);
    terminal(target, "jetbrains-fg", [
        0x000000, 0xf27481, 0x6bcc62, 0xe0ce70, 0x5594fa, 0xc092fa, 0x47ccbd, 0xced0d6,
        0x4e5157, 0xff6b7a, 0x67ff59, 0xffec1a, 0x3399ff, 0xd970ff, 0x40ffe9, 0xffffff
    ]);
    terminal(target, "jetbrains-bg", [
        0x1e1f22, 0xba3f4b, 0x288720, 0xa66900, 0x134ebf, 0x843ae0, 0x008576, 0xced0d6,
        0x4e5157, 0xff475a, 0x48e539, 0xffbf00, 0x1aafff, 0xb459ff, 0x22e5cf, 0xffffff
    ]);
    terminal(target, "terminator", [
        0x24292b, 0xa30000, 0x3e7b04, 0x9d8000, 0x295183, 0x5d4062, 0x047a7b, 0xa9aca6,
        0x444642, 0xbf2020, 0x6eb529, 0xcabb3f, 0x5b7fa6, 0x8a6586, 0x29b5b5, 0xbfbfbd
    ]);
    terminal(target, "xterm", [
        0x000000, 0xcd0000, 0x00cd00, 0xcdcd00, 0x0000ee, 0xcd00cd, 0x00cdcd, 0xe5e5e5,
        0x7f7f7f, 0xff0000, 0x00ff00, 0xffff00, 0x5c5cff, 0xff00ff, 0x00ffff, 0xffffff
    ]);
    terminal(target, "konsole", [
        0x232627, 0xed1515, 0x11d116, 0xf67400, 0x1d99f3, 0x9b59b6, 0x1abc9c, 0xfcfcfc,
        0x7f8c8d, 0xc0392b, 0x1cdc9a, 0xfdbc4b, 0x3daee9, 0x8e44ad, 0x16a085, 0xffffff
    ]);
    const SHADES: ReadonlyArray<number> = [0, 95, 135, 175, 215, 255];
    let row: HTMLElement;
    for (let r: number = 0; r < 6; ++r) {
        row = classed(target, "row");
        for (let i: number = 0; i < 36; ++i) {
            cell(row, r * 36 + 16 + i, SHADES[r], SHADES[Math.floor(i / 6) % 6], SHADES[i % 6]);
        }
    }
    row = classed(target, "row gs");
    for (let i: number = 0; i < 24; ++i) {
        const col: number = 8 + 10 * i;
        cell(row, 232 + i, col, col, col)
    }
    txt(classed(target, "center note"),
        "Colors 0-7 correspond to codes 30-37 or 40-47, colors 8-15 correspond to codes 90-97 or"
        + " 100-107."
    );
}
