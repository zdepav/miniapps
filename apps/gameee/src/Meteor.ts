import Random from '@/Random';
import Rectangle from '@/Rectangle';
import LineRenderer, { LinePath } from '@/LineRenderer';
import IEntity from '@/IEntity';
import IGame from '@/IGame';
import Shot from '@/Shot';
import Ship from '@/Ship';


export default class Meteor implements IEntity {
    private readonly game: IGame;
    private x: number;
    private life: number;
    private readonly y: number;
    private readonly size: number;
    private readonly radius: number;
    private readonly c1: string;
    private readonly c2: string;

    private static readonly smallView: LinePath = LinePath.Parse(
        "G16,0;V8;H-8;V8;H-16;V-8;H-8;V-16;H8;V-8;H16;V24;H-16;V-16;H24;V8"
    );
    private static readonly mediumView: LinePath = LinePath.Parse(
        "G24,0;V8;H-8;V8;H-8;V8;H-16;V-8;H-8;V-8;H-8;V-16;H8;V-8;H8;V-8;H16;V8;H8;V24;H-8;V8;H-16"
        + ";V-8;H-8;V-16;H8;V-8;H16;V8;H16;V8"
    );
    private static readonly largeView: LinePath = LinePath.Parse(
        "G32,0;V16;H-8;V8;H-8;V8;H-32;V-8;H-8;V-8;H-8;V-32;H8;V-8;H8;V-8;H32;V8;H8;V40;H-8;V8;H-32"
        + ";V-8;H-8;V-32;H8;V-8;H32;V8;H16;V16"
    );

    get Dead(): boolean { return this.life <= 0; }

    get Size(): number { return this.size; }

    constructor(game: IGame) {
        this.game = game;
        this.size = Random.Next(4);
        if (this.size == 0) this.size = 1;
        this.radius = (this.size + 1) * 8;
        this.x = game.Width + this.radius;
        this.y = Random.Next(game.Height);
        this.life = this.size * 50;
        const b: number = 192 - Random.Next(64);
        const rg: number = b / 2 + Random.Next(b / 2);
        this.c1 = `rgb(${rg},${rg},${b})`;
        this.c2 = `rgb(${rg},${rg},${rg})`;
    }

    Hit(e: IEntity): boolean {
        if (this.Dead) {
            return false;
        }
        switch (this.size) {
            case 1:
                if (
                    this.RectWasHit(this.x - 16, this.y - 8, this.x + 16, this.y + 8, e)
                    || this.RectWasHit(this.x - 8, this.y - 16, this.x + 8, this.y + 16, e)
                ) {
                    this.Hurt(e);
                    return true;
                }
                break;
            case 2:
                if (
                    this.RectWasHit(this.x - 24, this.y - 8, this.x + 24, this.y + 8, e)
                    || this.RectWasHit(this.x - 16, this.y - 16, this.x + 16, this.y + 16, e)
                    || this.RectWasHit(this.x - 8, this.y - 24, this.x + 8, this.y + 24, e)
                ) {
                    this.Hurt(e);
                    return true;
                }
                break;
            case 3:
                if (
                    this.RectWasHit(this.x - 32, this.y - 16, this.x + 32, this.y + 16, e)
                    || this.RectWasHit(this.x - 24, this.y - 24, this.x + 24, this.y + 24, e)
                    || this.RectWasHit(this.x - 16, this.y - 32, this.x + 16, this.y + 32, e)
                ) {
                    this.Hurt(e);
                    return true;
                }
                break;
        }
        return false;
    }

    private Hurt(e: IEntity): void {
        if (e instanceof Shot) {
            this.life -= Random.Next(10, 16);
        }
        else if (e instanceof Ship) {
            this.life = 0;
        }
        if (this.Dead) {
            this.game.CreateSparkles(
                this.x + 4,
                this.y,
                8 + this.size * 8,
                this.size == 3 ? 52 : this.size * 12
            );
            if (e instanceof Shot) {
                this.game.AddScore(100 * this.size * this.size);
            }
        }
    }

    Explode(): void {
        if (this.Dead) {
            return;
        }
        this.life = 0;
        this.game.CreateSparkles(
            this.x + 4,
            this.y,
            8 + this.size * 8,
            this.size == 3 ? 52 : this.size * 12
        );
        this.game.AddScore(50 * this.size * this.size);
    }

    private RectWasHit(x1: number, y1: number, x2: number, y2: number, e: IEntity): boolean {
        if (e instanceof Shot) {
            return e.Y >= y1 && e.Y <= y2 && e.X >= x1 - 6 && e.X <= x2;
        } else if (e instanceof Ship) {
            return new Rectangle(x1, y1, x2 - x1, y2 - y1).IntersectsWith(e.Bounds);
        }
        return false;
    }

    Step(elapsedTime: number): void {
        if (this.Dead) {
            return;
        }
        this.x -= Math.round(elapsedTime / (this.size == 1 ? 5.0 : this.size == 2 ? 10.0 : 20.0));
        if (this.x < -this.radius) {
            this.life = -1;
        }
    }

    Draw(r: LineRenderer): void {
        if (this.Dead) {
            return;
        }
        const gradient: CanvasGradient = r.CreateGradient(
            this.x - this.radius, this.y - this.radius, this.c1,
            this.x + this.radius, this.y + this.radius, this.c2
        );
        switch (this.size) {
            case 1: Meteor.smallView.Draw(r, this.x, this.y, gradient); break;
            case 2: Meteor.mediumView.Draw(r, this.x, this.y, gradient); break;
            case 3: Meteor.largeView.Draw(r, this.x, this.y, gradient); break;
        }
    }
}