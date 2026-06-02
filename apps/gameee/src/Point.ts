export default class Point {
    readonly X: number;
    readonly Y: number;

    constructor(x: number, y: number) {
        this.X = x;
        this.Y = y;
    }

    static readonly Empty: Point = new Point(0, 0);
}
