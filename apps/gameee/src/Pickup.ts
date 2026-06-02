import LineRenderer, { LinePath } from '@/LineRenderer';
import IEntity from '@/IEntity';
import Random from '@/Random';
import IGame from '@/IGame';
import Ship from '@/Ship';
import Rectangle from '@/Rectangle';


export enum PickupType { Health = 0, Upgrade = 1, Bomb = 2 }


export default class Pickup implements IEntity {

    private x: number;
    private blinkTimer: number;
    private readonly y: number;
    readonly PickupType: PickupType;
    private dead: boolean;

    private static readonly crossView: LinePath = LinePath.Parse(
        "G8,0;V4;H-4;V4;H-8;V-4;H-4;V-8;H4;V-4;H8;V4;H4;V4;G6,0;V2;H-4;V4;H-4;V-4;H-4;V-4;H4;V-4"
        + ";H4;V4;H4;V2"
    );
    private static readonly uView: LinePath = LinePath.Parse(
        "G0,8;H-8;V-16;H6;V10;H4;V-10;H6;V16;H-8;G5,-5;V10;H-10;V-10"
    );
    private static readonly bombView: LinePath = LinePath.Parse(
        "G0,-8;V16;G-3,-8;V2;H6;V-2;G-3,-3;H6;V11;H-6;V-11"
    );

    get Dead(): boolean { return this.dead; }

    constructor(game: IGame) {
        this.PickupType = <PickupType>Random.Next(3);
        this.x = game.Width + 16;
        this.y = Random.Next(game.Height);
        this.dead = false;
        this.blinkTimer = 0;
    }

    Step(elapsedTime: number): void {
        if (this.dead) {
            return;
        }
        this.x -= Math.round(elapsedTime / 4.0);
        this.blinkTimer = (this.blinkTimer + Math.round(elapsedTime)) % 360;
        if (this.x < -16) {
            this.dead = true;
        }
    }

    Draw(r: LineRenderer): void {
        if (this.dead) {
            return;
        }
        const c: number = (Math.sin(this.blinkTimer * Math.PI / 180.0) + 1.0) / 2.0;
        switch (this.PickupType) {
            case PickupType.Health:
                const gb: number = Math.round(c * 128);
                this.DrawImpl(r, Pickup.crossView, 255, gb, gb);
                break;
            case PickupType.Upgrade:
                this.DrawImpl(
                    r, Pickup.uView,
                    Math.round(c * 64 + 128), Math.round(c * 96 + 64), Math.round(c * 128)
                );
                break;
            case PickupType.Bomb:
                this.DrawImpl(
                    r, Pickup.bombView,
                    Math.round(c * 128), Math.round(c * 96 + 128), 255
                );
                break;
        }
    }

    private DrawImpl(r: LineRenderer, view: LinePath, R: number, G: number, B: number): void {
        view.Draw(r, this.x, this.y, `rgb(${R},${G},${B})`);
    }

    Picked(ship: Ship): boolean {
        if (this.dead) {
            return false;
        } else if (new Rectangle(this.x - 8, this.y - 8, 17, 17).IntersectsWith(ship.Bounds)) {
            this.dead = true;
            return true;
        }
        return false;
    }
}