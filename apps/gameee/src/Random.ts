export default class Random {

    static Next(a: number, b?: number): number {
        if (b != null) {
            return Math.floor(a + Math.random() * (b - a));
        }
        return Math.floor(Math.random() * a);
    }

    static NextBool(): boolean {
        return Math.random() < 0.5;
    }
}