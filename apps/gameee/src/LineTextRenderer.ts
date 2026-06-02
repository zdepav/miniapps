import LineRenderer, { LinePath } from '@/LineRenderer';
import Point from '@/Point';


interface ITag {
    Use(s: State, param: string | null): void;
}


class ColorTag implements ITag {

    Use(s: State, param: string | null): void {
        s.pen = param == null ? "#000" : `rgb(${param})`;
    }
}

class BoldTag implements ITag {

    private readonly bold: boolean;

    constructor(bold: boolean) {
        this.bold = bold;
    }

    Use(s: State): void {
        s.bold = this.bold;
    }
}

class MarkTag implements ITag {

    private readonly left: boolean;
    private readonly top: boolean;

    constructor(left: boolean, top: boolean) {
        this.left = left;
        this.top = top;
    }

    Use(s: State): void {
        s.marks.push(new Point(this.left ? s.x : s.x + 8, this.top ? s.y : s.y + 16));
    }
}

class State {
    readonly str: string;
    pen: string;
    private readonly lx: number;
    i: number;
    x: number;
    y: number;
    bold: boolean;
    readonly marks: Array<Point>;

    get C(): string { return this.str[this.i]; }

    get EOS(): boolean { return this.i >= this.str.length; }

    constructor(str: string, x: number, y: number) {
        this.str = str;
        this.pen = "#fff";
        this.x = x;
        this.lx = x;
        this.y = y;
        this.i = 0;
        this.bold = false;
        this.marks = [];
    }

    NewLine(): void {
        this.x = this.lx;
        this.y += 19;
    }
}


const CHARS: Array<[string, string]> = [
    ['A', "G1,15;V-14;H6;V14;G1,8;H6"],
    ['B', "G1,8;H6;V7;H-6;V-14;H4;V7"],
    ['C', "G7,3;V-2;H-6;V14;H6;V-2"],
    ['D', "G1,1;H4;V2;H2;V10;H-2;V2;H-4;V-14"],
    ['E', "G7,1;H-6;V14;H6;G1,8;H3"],
    ['F', "G7,1;H-6;V14;G1,8;H3"],
    ['G', "G7,3;V-2;H-6;V14;H6;V-7;H-2"],
    ['H', "G1,1;V14;G7,1;V14;G1,8;H6"],
    ['I', "G3,1;H2;G3,15;H2;G4,1;V14"],
    ['J', "G3,1;H2;G4,1;V14;H-4;V-2"],
    ['K', "G1,1;V14;G1,8;H6;V7;G5,1;V7"],
    ['L', "G1,1;V14;H6"],
    ['M', "G1,1;V14;G1,3;H6;G7,1;V14"],
    ['N', "G1,15;V-14;H3;V14;H3;V-14"],
    ['O', "G1,1;H6;V14;H-6;V-14"],
    ['P', "G1,15;V-14;H6;V7;H-6"],
    ['Q', "G5,15;H-4;V-14;H6;V14;H-2;V-3"],
    ['R', "G1,15;V-14;H6;V7;H-6;G5,8;V7"],
    ['S', "G7,3;V-2;H-6;V7;H6;V7;H-6;V-2"],
    ['T', "G1,1;H6;G4,1;V14"],
    ['U', "G1,1;V14;H6;V-14"],
    ['V', "G1,1;V8;H2;V6;H2;V-6;H2;V-8"],
    ['W', "G1,1;V12;H1;V2;H1;V-3;H2;V3;H1;V-2;H1;V-12"],
    ['X', "G1,1;V4;H3;V6;H-3;V4;G7,1;V4;H-3;V6;H3;V4"],
    ['Y', "G1,1;V4;H6;V-4;G4,5;V10"],
    ['Z', "G1,1;H6;V7;H-6;V7;H6"],
    ['0', "G1,1;H6;V14;H-6;V-14;G1,9;H3;V-2;H3"],
    ['1', "G3,3;V-2;H2;V14"],
    ['2', "G1,3;V-2;H6;V7;H-6;V7;H6"],
    ['3', "G1,3;V-2;H6;V14;H-6;V-2;G7,8;H-3"],
    ['4', "G1,1;V7;H6;G5,5;V10"],
    ['5', "G7,1;H-6;V7;H6;V7;H-6;V-2"],
    ['6', "G7,3;V-2;H-6;V14;H6;V-7;H-6"],
    ['7', "G1,1;H6;V14"],
    ['8', "G1,8;V-7;H6;V14;H-6;V-7;H6"],
    ['9', "G1,13;V2;H6;V-14;H-6;V7;H6"],
    [':', "G3,4;V2;G3,10;V2"],
    ['.', "G4,13;V2"],
    [',', "G4,12;V4"],
    [';', "G3,6;V2;G3,12;V4"],
    ['!', "G4,1;V9;G4,13;V2"],
    ['?', "G1,3;V-2;H6;V6;H-3;V3;G4,13;V2"],
    ['"', "G3,1;V3;G5,1;V3"],
    ["'", "G4,1;V3"],
    ['[', "G5,1;H-3;V14;H3"],
    [']', "G3,1;H3;V14;H-3"],
    ['+', "G1,8;H6;G4,5;V6"],
    ['-', "G1,8;H6"],
    ['_', "G0,16;H8"],
    ['=', "G1,6;H6;G1,10;H6"],
    ['/', "G4,0;V16"],
    ['|', "G4,0;V16"]
];


function IsLetterOrDigit(char: number): boolean {
    return (char > 47 && char < 58) || (char > 64 && char < 91) || (char > 96 && char < 123);
}


export default class LineTextRenderer {

    private static readonly paths: Map<string, LinePath> = new Map();

    private static readonly tags: Record<string, ITag> = {
        color: new ColorTag(),
        b: new BoldTag(true),
        n: new BoldTag(false),
        ltmark: new MarkTag(true, true),
        lbmark: new MarkTag(true, false),
        rtmark: new MarkTag(false, true),
        rbmark: new MarkTag(false, false)
    };

    static init(): void {
        for (const [char, path] of CHARS) {
            LineTextRenderer.paths.set(char, LinePath.Parse(path));
        }
    }

    private readonly renderer: LineRenderer;

    constructor(renderer: LineRenderer) {
        this.renderer = renderer;
    }

    Draw(str: string, x: number, y: number): Array<Point> {
        return this.DrawImpl(new State(str, x, y));
    }

    private DrawImpl(s: State): Array<Point> {
        while (!s.EOS) {
            if (s.C == '\n') {
                s.NewLine();
            } else if (s.C == '\\') {
                this.UseTag(s);
            } else {
                const char: string = s.C.toUpperCase();
                const path: LinePath | undefined = LineTextRenderer.paths.get(char);
                if (path != null) {
                    path.Draw(this.renderer, s.x, s.y, s.pen);
                    if (s.bold) {
                        path.Draw(this.renderer, s.x + 1, s.y, s.pen);
                    }
                }
                s.x += 11;
            }
            ++s.i;
        }
        return s.marks;
    }

    private UseTag(s: State): void {
        if (s.C != '\\') {
            return;
        }
        ++s.i;
        let b: number = s.i;
        while (!s.EOS && IsLetterOrDigit(s.C.charCodeAt(0))) {
            ++s.i;
        }
        let tag: string = s.str.substring(b, s.i);
        let param: string | null = null;
        // @ts-ignore false positive, s.C is a getter dependent on s.i, not a constant
        if (!s.EOS && s.C == '(') {
            ++s.i;
            b = s.i;
            while (!s.EOS && s.C != ')') {
                ++s.i;
            }
            param = s.str.substring(b, s.i);
        }
        LineTextRenderer.tags[tag].Use(s, param);
    }
}


LineTextRenderer.init();



