import LineRenderer from '@/LineRenderer';


export default interface IEntity {
    readonly Dead: boolean;

    Step(elapsedTime: number): void;

    Draw(r: LineRenderer): void;
}
