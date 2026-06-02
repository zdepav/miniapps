import IEntity from '@/IEntity';
import IGame from '@/IGame';
import LineRenderer from '@/LineRenderer';
import Meteor from '@/Meteor';
import Random from '@/Random';


export default class Shot implements IEntity {
    private readonly game: IGame;
    private x: number;
    private readonly y: number;
    private readonly pen: string;
    private dead: boolean;

    get X(): number { return this.x; }

    get Y(): number { return this.y; }

    get Dead(): boolean { return this.dead; }

    constructor(x: number, y: number, game: IGame) {
        this.x = x;
        this.y = y;
        this.game = game;
        this.dead = false;
        this.pen = `rgb(255,${128 + Random.Next(128)},0)`;
    }

    Step(elapsedTime: number): void {
        if (this.dead) {
            return;
        }
        this.x += Math.round(elapsedTime / 2.0);
        if (this.x >= this.game.Width) {
            this.dead = true;
            return;
        }
        for (
            const meteor of this.game.Entities.filter((e: IEntity): boolean => e instanceof Meteor)
        ) {
            if ((<Meteor>meteor).Hit(this)) {
                this.dead = true;
                this.game.CreateSparkles(this.x + 4, this.y, 4, Random.Next(3) + 1);
            }
        }
    }

    Draw(r: LineRenderer): void {
        if (this.dead) {
            return;
        }
        r.GoTo(this.x, this.y);
        r.HLine(this.pen, 7);
    }
}
