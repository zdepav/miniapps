import Point from '@/Point';


export default class Rectangle {
    readonly X: number;
    readonly Y: number;
    readonly Width: number;
    readonly Height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.X = x;
        this.Y = y;
        this.Width = width;
        this.Height = height;
    }

    IntersectsWith(other: Rectangle): boolean {
        return (
            this.X < other.X + other.Width && this.X + this.Width > other.X
            && this.Y < other.Y + other.Height && this.Y + this.Height > other.Y
        );
    }

    Contains(pt: Point): boolean {
        return (
            this.X <= pt.X && pt.X < this.X + this.Width
            && this.Y <= pt.Y && pt.Y < this.Y + this.Height
        );
    }

    static readonly Empty: Rectangle = new Rectangle(0, 0, 0, 0);
}
