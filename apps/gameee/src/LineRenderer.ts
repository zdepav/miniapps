interface Step {

    Apply(lr: LineRenderer, x: number, y: number, pen: string | CanvasGradient): void;
}

class GoTo implements Step {
    readonly X: number;
    readonly Y: number;

    constructor(x: number, y: number) {
        this.X = x;
        this.Y = y;
    }

    Apply(lr: LineRenderer, x: number, y: number): void {
        lr.GoTo(this.X + x, this.Y + y);
    }
}


class H implements Step {
    readonly L: number;

    constructor(l: number) {
        this.L = l;
    }

    Apply(lr: LineRenderer, _x: number, _y: number, pen: string | CanvasGradient): void {
        lr.HLine(pen, this.L);
    }
}


class V implements Step {
    readonly L: number;

    constructor(l: number) {
        this.L = l;
    }

    Apply(lr: LineRenderer, _x: number, _y: number, pen: string | CanvasGradient): void {
        lr.VLine(pen, this.L);
    }
}


export class LinePath {

    private readonly steps: Array<Step>;

    private constructor(steps: Array<Step>) {
        this.steps = steps;
    }

    static Parse(path: string): LinePath {
        const pathSteps: Array<Step> = [];
        for (const step of path.split(';').filter((s: string): boolean => s.length > 0)) {
            if (step[0] == 'G') {
                const xy: Array<string> = step.substring(1).split(',');
                pathSteps.push(new GoTo(parseInt(xy[0]), parseInt(xy[1])));
            } else if (step[0] == 'V') {
                pathSteps.push(new V(parseInt(step.substring(1))));
            } else if (step[0] == 'H') {
                pathSteps.push(new H(parseInt(step.substring(1))));
            }
        }
        return new LinePath(pathSteps);
    }

    Draw(lr: LineRenderer, x: number, y: number, pen: string | CanvasGradient): void {
        for (const step of this.steps) {
            step.Apply(lr, x, y, pen);
        }
    }
}


export default class LineRenderer {
    private readonly ctx: CanvasRenderingContext2D;
    private x: number;
    private y: number;
    private drawnLineCount: number;
    private pen: string | CanvasGradient | null;
    private empty: boolean;

    get DrawnLineCount(): number { return this.drawnLineCount; }

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.x = 0;
        this.y = 0;
        this.drawnLineCount = 0;
        this.pen = null;
        this.empty = true;
    }

    GoTo(x: number, y: number): void {
        this.Flush();
        this.x = x;
        this.y = y;
    }

    private StartLine(pen: string | CanvasGradient): void {
        if (pen !== this.pen) {
            this.Flush();
            this.pen = pen;
        }
        if (this.empty) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.x + 0.5, this.y + 0.5);
        }
    }

    HLine(pen: string | CanvasGradient, length: number): void {
        ++this.drawnLineCount;
        this.StartLine(pen);
        this.ctx.lineTo((this.x += length) + 0.5, this.y + 0.5);
        this.empty = false;
    }

    VLine(pen: string | CanvasGradient, length: number): void {
        ++this.drawnLineCount;
        this.StartLine(pen);
        this.ctx.lineTo(this.x + 0.5, (this.y += length) + 0.5);
        this.empty = false;
    }

    Flush(): void {
        if (!this.empty) {
            this.ctx.strokeStyle = this.pen!;
            this.ctx.stroke();
        }
        this.empty = true;
    }

    CreateGradient(
        x1: number, y1: number, c1: string,
        x2: number, y2: number, c2: string
    ): CanvasGradient {
        const gradient: CanvasGradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, c1);
        gradient.addColorStop(1, c2);
        return gradient;
    }
}
