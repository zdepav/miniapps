import IEntity from '@/IEntity';
import LineRenderer, { LinePath } from './LineRenderer';
import Rectangle from '@/Rectangle';
import IGame from '@/IGame';
import Meteor from '@/Meteor';
import Pickup, { PickupType } from '@/Pickup';
import Random from '@/Random';


export default class Ship implements IEntity {
    private readonly game: IGame;
    private x: number;
    private y: number;
    private xSpeed: number;
    private ySpeed: number;
    private shotCooldown: number;
    private health: number;
    private flameTimer: number;
    private upgradedTimer: number;
    private leftGunIsNext: boolean;

    private static readonly c1: string = "#ff7f50";
    private static readonly c2: string = "#ffd700";
    private static readonly uc1: string = "#808000";
    private static readonly uc2: string = "#adff2f";
    private static readonly upgradedView: LinePath = LinePath.Parse(
        "G16,0;V4;H-4;V2;H4;H-4;V2;H4;H-4;V2;H4;H-8;V3;H-10;V3;H-11;V-6;H-3;V-20;H3;V-6;H11;V3;H10"
        + ";V3;H8;H-4;V2;H4;H-4;V2;H4;H-4;V2;H4;V4"
    );
    private static readonly normalView: LinePath = LinePath.Parse(
        "G16,0;V4;H-4;V4;H4;H-4;V2;H-4;V3;H-10;V3;H-11;V-6;H-3;V-20;H3;V-6;H11;V3;H10;V3;H4;V2;H4"
        + ";H-4;V4;H4;V4"
    );

    get Bounds(): Rectangle { return new Rectangle(this.x - 16, this.y - 16, 32, 32); }

    get Dead(): boolean { return this.health <= 0; }

    constructor(x: number, y: number, game: IGame) {
        this.x = x;
        this.y = y;
        this.game = game;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.shotCooldown = 0;
        this.flameTimer = 0;
        this.upgradedTimer = 0;
        this.leftGunIsNext = true;
        this.health = 1000;
    }

    Step(elapsedTime: number): void {
        if (this.Dead) {
            return;
        }
        const w: boolean = this.game.Keyboard.IsDown("W");
        const a: boolean = this.game.Keyboard.IsDown("A");
        const s: boolean = this.game.Keyboard.IsDown("S");
        const d: boolean = this.game.Keyboard.IsDown("D");
        if (!a || !d) {
            if (a) {
                this.xSpeed = Math.max(this.xSpeed - 1, -5);
            } else if (d) {
                this.xSpeed = Math.min(this.xSpeed + 1, 5);
            } else if (this.xSpeed < 0) {
                this.xSpeed = this.xSpeed + 1;
            } else {
                this.xSpeed = this.xSpeed > 0 ? this.xSpeed - 1 : this.xSpeed;
            }
        }
        if (!w || !s) {
            if (w) {
                this.ySpeed = Math.max(this.ySpeed - 1, -5);
            } else if (s) {
                this.ySpeed = Math.min(this.ySpeed + 1, 5);
            } else if (this.ySpeed < 0) {
                this.ySpeed = this.ySpeed + 1;
            } else {
                this.ySpeed = this.ySpeed > 0 ? this.ySpeed - 1 : this.ySpeed;
            }
        }
        this.x += Math.round(elapsedTime * this.xSpeed / 20.0);
        if (this.x < 16) {
            this.x = 16;
        } else if (this.x > this.game.Width - 17) {
            this.x = this.game.Width - 17;
        }
        this.y += Math.round(elapsedTime * this.ySpeed / 20.0);
        if (this.y < 16) {
            this.y = 16;
        } else if (this.y > this.game.Height - 17) {
            this.y = this.game.Height - 17;
        }

        if (this.shotCooldown > 0) {
            this.shotCooldown = Math.max(0, this.shotCooldown - Math.round(elapsedTime));
        }
        if (this.shotCooldown == 0) {
            if (this.upgradedTimer > 0) {
                this.game.CreateShot(this.x + 16, this.y - 10);
                this.game.CreateShot(this.x + 16, this.y - 8);
                this.game.CreateShot(this.x + 16, this.y - 6);
                this.game.CreateShot(this.x + 16, this.y + 6);
                this.game.CreateShot(this.x + 16, this.y + 8);
                this.game.CreateShot(this.x + 16, this.y + 10);
            } else {
                this.game.CreateShot(this.x + 16, this.leftGunIsNext ? this.y - 8 : this.y + 8);
                this.leftGunIsNext = !this.leftGunIsNext;
            }
            this.shotCooldown = 80;
        }

        for (const entity of this.game.Entities) {
            if (entity instanceof Meteor) {
                if (entity.Hit(this)) {
                    this.health -= entity.Size * Random.Next(25, 51);
                }
            } else if (entity instanceof Pickup) {
                if (entity.Picked(this)) switch (entity.PickupType) {
                    case PickupType.Health:
                        this.health = Math.min(this.health + 250, 1000);
                        break;
                    case PickupType.Upgrade:
                        this.upgradedTimer = 2500;
                        break;
                    case PickupType.Bomb:
                        this.game.Explode();
                        break;
                }
            }
        }
        if (this.Dead) {
            this.game.CreateFlames(this.x, this.y, 24, 20);
            this.game.End();
            return;
        }
        if (this.upgradedTimer > 0) {
            this.upgradedTimer = Math.max(0, this.upgradedTimer - Math.round(elapsedTime));
        }
        if (this.health > 950) {
            return;
        }
        this.flameTimer += Math.round((10 - this.health / 100) * elapsedTime);
        if (this.flameTimer > 1000) {
            this.game.CreateFlames(this.x, this.y, 16, this.health < 500 ? 2 : 1);
            this.flameTimer -= 1000;
        }
    }

    Draw(r: LineRenderer): void {
        if (this.Dead) {
            return;
        } else if (this.upgradedTimer > 0) {
            Ship.upgradedView.Draw(r, this.x, this.y, r.CreateGradient(
                this.x - 17, this.y, Ship.uc1,
                this.x + 17, this.y, Ship.uc2
            ));
        } else {
            Ship.normalView.Draw(r, this.x, this.y, r.CreateGradient(
                this.x - 17, this.y, Ship.c1,
                this.x + 17, this.y, Ship.c2
            ));
        }
    }
}
