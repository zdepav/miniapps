import LineRenderer from '@/LineRenderer';
import IEntity from '@/IEntity';
import Random from '@/Random';


export default class Sparkle implements IEntity {

    private readonly x: number;
    private readonly y: number;
    private size: number;
    private readonly pen: string;

    get Dead(): boolean { return this.size == 0; }

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.size = Random.Next(4, 7);
        this.pen = `rgb(255,255,${128 + Random.Next(128)})`;
    }

    Step(): void {
        if (!this.Dead) {
            --this.size;
        }
    }

    Draw(r: LineRenderer): void {
        if (this.Dead) {
            return;
        }
        r.GoTo(this.x, this.y - this.size);
        r.VLine(this.pen, this.size * 2 + 1);
        r.GoTo(this.x - this.size, this.y);
        r.HLine(this.pen, this.size * 2 + 1);
        if (this.size > 3) {
            r.GoTo(this.x + 3, this.y - 1);
            r.VLine(this.pen, 2);
            r.GoTo(this.x - 3, this.y - 1);
            r.VLine(this.pen, 2);
            r.GoTo(this.x - 1, this.y + 3);
            r.HLine(this.pen, 2);
            r.GoTo(this.x - 1, this.y - 3);
            r.HLine(this.pen, 2);
        }
    }
}