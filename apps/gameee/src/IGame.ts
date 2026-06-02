import IEntity from '@/IEntity';
import Keyboard from '@/Keyboard';
import Mouse from '@/Mouse';


export default interface IGame {
    readonly Width: number;
    readonly Height: number;
    readonly Entities: ReadonlyArray<IEntity>;
    readonly Keyboard: Keyboard;
    readonly Mouse: Mouse;

    AddScore(ammount: number): void;

    CreateShot(x: number, y: number): void;

    CreateFlames(x: number, y: number, radius: number, count: number): void;

    CreateSparkles(x: number, y: number, radius: number, count: number): void;

    Explode(): void;

    End(): void;
}
