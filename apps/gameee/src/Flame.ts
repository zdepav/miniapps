import IEntity from '@/IEntity';
import Random from '@/Random';
import LineRenderer from '@/LineRenderer';


export default class Flame implements IEntity {
    private size: number;
    private readonly pen: string;
    private readonly parts: Array<[number, number, boolean]>;

    get Dead(): boolean { return this.size == 0; }

    constructor(x: number, y: number) {
        this.size = Random.Next(6, 9);
        const blue: number = Random.Next(64);
        this.pen = `rgb(255,${blue * 2},${Random.Next(blue)})`;
        const partCount: number = Random.Next(4, 7);
        this.parts = [];
        for (let i: number = 0; i < partCount; ++i) {
            const d: number = Random.Next(5);
            if (d == 0) {
                this.parts.push([x, y, Random.NextBool()]);
            } else {
                const a: number = Random.Next(360) * Math.PI / 180.0;
                this.parts.push([
                    x + Math.round(d * Math.cos(a)),
                    y + Math.round(d * Math.sin(a)),
                    Random.NextBool()
                ]);
            }
        }
    }

    Step(): void {
        if (!this.Dead) {
            --this.size;
        }
    }

    Draw(r: LineRenderer): void {
        const size_d4: number = Math.floor(this.size / 4);
        const size_d2: number = Math.floor(this.size / 2);
        for (const [x, y, h] of this.parts) {
            if (h) {
                r.GoTo(x - size_d4, y);
                r.HLine(this.pen, size_d2);
            } else {
                r.GoTo(x, y - size_d4);
                r.VLine(this.pen, size_d2);
            }
        }
    }
}
