import Point from '@/Point';


export default class Mouse {
    private leftButton: boolean;
    private middleButton: boolean;
    private rightButton: boolean;
    private location: Point;

    get LeftButton(): boolean { return this.leftButton; }

    get MiddleButton(): boolean { return this.middleButton; }

    get RightButton(): boolean { return this.rightButton; }

    get Location(): Point { return this.location; }

    get X(): number { return this.location.X; }

    get Y(): number { return this.location.Y; }

    constructor() {
        this.leftButton = false;
        this.middleButton = false;
        this.rightButton = false;
        this.location = Point.Empty;
    }

    public PressMouseButton(button: number): void {
        switch (button) {
            case 0: this.leftButton = true; break;
            case 1: this.middleButton = true; break;
            case 2: this.rightButton = true; break;
        }
    }

    public ReleaseMouseButton(button: number): void {
        switch (button) {
            case 0: this.leftButton = false; break;
            case 1: this.middleButton = false; break;
            case 2: this.rightButton = false; break;
        }
    }

    public MoveMouse(location: Point): void {
        this.location = location;
    }
}
