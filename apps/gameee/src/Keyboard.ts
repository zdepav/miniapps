export default class Keyboard {

    private readonly keys: Map<string, boolean>;

    constructor() {
        this.keys = new Map();
    }

    IsDown(key: string): boolean {
        return this.keys.get(key) === true;
    }

    public PressKey(key: string): void {
        this.keys.set(key, true);
    }

    public ReleaseKey(key: string): void {
        this.keys.set(key, false);
    }
}
