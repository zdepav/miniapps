import IEntity from "@/IEntity";
import Ship from "@/Ship";
import IGame from "@/IGame";
import LineRenderer, { LinePath } from "@/LineRenderer";
import Keyboard from "@/Keyboard";
import Mouse from "@/Mouse";
import Random from "@/Random";
import Rectangle from "@/Rectangle";
import Settings from "@/Settings";
import LineTextRenderer from '@/LineTextRenderer';
import Point from '@/Point';
import Shot from '@/Shot';
import Sparkle from '@/Sparkle';
import Flame from '@/Flame';
import Meteor from '@/Meteor';
import Pickup from '@/Pickup';


const INTERVAL_COUNT: number = 50;
const CONTROLS: string = `

\\b()Controls:\\n()

W   = Up
A   = Left
S   = Down
D   = Right

P   = Pause
M   = Toggle music
F   = Show or Hide FPS
R   = Start game
H   = Show or Hide help

\\b()Music:\\n()
TeknoAXE - Threshold of Insanity \\color(64,160,255)\\ltmark()[link]\\rbmark()\\color(255,255,255)

`.trim();


export default class Game implements IGame {
    private ship: Ship | null;
    private readonly stars: Array<[number, number]>;
    private readonly entities: Array<IEntity>;
    private readonly newEntities: Array<IEntity>;
    private meteorTimer: number;
    private pickupTimer: number;
    private minMeteorInterval: number;
    private blinkTimer: number;
    private score: number;
    private scoreTimer: number;
    private readonly intervals: Array<number>;
    private intervalIndex: number;
    private paused: boolean;
    private shouldExplode: boolean;
    private showingInfo: boolean;
    private showingFps: boolean;
    private readonly soundPlayer: HTMLAudioElement;
    private musicLinkLocation: Rectangle;
    private running: boolean;
    readonly Keyboard: Keyboard;
    readonly Settings: Settings;
    readonly Mouse: Mouse;
    readonly Width: number;
    readonly Height: number;

    private static readonly background: string = "#202020";
    private static readonly starPen: string = "#303030";
    private static readonly logoOuterPen: string = "#267f00";
    private static readonly logoInnerPen: string = "#83af70";
    private static readonly logoOuterView: LinePath = LinePath.Parse(
        "G3,3;H20;V8;H-2;V-6;H-16;V40;H16;V-19;H-6;V-2;H8;V23;H-20;V-44;"     // G
        + "G30,3;H20;V44;H-2;V-21;H-16;V21;H-2;V-44;G32,5;H16;V19;H-16;V-19;" // A
        + "G57,3;V44;H2;V-36;H16;V36;H2;V-44;H-2;V6;H-16;V-6;H-2;"            // M
        + "G84,3;H20;V2;H-18;V19;H9;V2;H-9;V19;H18;V2;H-20;V-44;"             // E
        + "G111,3;H20;V2;H-18;V19;H9;V2;H-9;V19;H18;V2;H-20;V-44;"            // E
        + "G138,3;H20;V2;H-18;V19;H9;V2;H-9;V19;H18;V2;H-20;V-44"             // E
    );
    private static readonly logoInnerView: LinePath = LinePath.Parse(
        "G22,10;V-6;H-18;V42;H18;V-21;H-6;" + "G31,46;V-42;H18;V42;G31,25;H18;" // GA
        + "G58,4;V42;G58,10;H18;G76,4;V42;" + "G103,4;H-18;V42;H18;G85,25;H9;"  // ME
        + "G130,4;H-18;V42;H18;G112,25;H9;" + "G157,4;H-18;V42;H18;G139,25;H9;" // EE
    );

    get Entities(): ReadonlyArray<IEntity> { return this.entities; }

    get Running(): boolean { return this.running; }

    constructor(width: number, height: number, music: HTMLAudioElement) {
        this.Width = width;
        this.Height = height;
        this.Keyboard = new Keyboard();
        this.Mouse = new Mouse();
        this.stars = [];
        for (let i: number = 0; i < 100; ++i) {
            this.stars.push([Random.Next(this.Width + 48) - 47, Random.Next(this.Height)]);
        }
        this.ship = null;
        this.entities = [];
        this.newEntities = [];
        this.intervals = [];
        this.score = 0;
        this.blinkTimer = 0;
        this.minMeteorInterval = 1000;
        this.meteorTimer = Random.Next(400);
        this.paused = false;
        this.Settings = new Settings();
        this.soundPlayer = music;
        this.soundPlayer.loop = true;
        this.soundPlayer.volume = 0.5;
        if (this.Settings.PlayMusic) {
            // noinspection JSIgnoredPromiseFromCall
            this.soundPlayer.play();
        }
        this.shouldExplode = false;
        this.running = false;
        this.showingInfo = false;
        this.showingFps = false;
        this.musicLinkLocation = Rectangle.Empty;
        this.intervalIndex = 0;
        this.scoreTimer = 0;
        this.pickupTimer = 0;
    }

    private Reset(): void {
        this.minMeteorInterval = 1000;
        this.meteorTimer = Random.Next(400);
        this.pickupTimer = Random.Next(8000, 12000);
        this.score = 0;
        this.entities.length = 0;
        this.newEntities.length = 0;
        this.ship = new Ship(100, this.Height / 2, this);
        this.running = true;
    }

    public Draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = Game.background;
        ctx.fillRect(0, 0, this.Width, this.Height);
        const renderer: LineRenderer = new LineRenderer(ctx);
        const textRenderer: LineTextRenderer = new LineTextRenderer(renderer);
        if (this.showingInfo) {
            Game.logoOuterView.Draw(renderer, this.Width / 2 - 81, 5, Game.logoOuterPen);
            Game.logoInnerView.Draw(renderer, this.Width / 2 - 81, 5, Game.logoInnerPen);
            const [lt, rb] = textRenderer.Draw(CONTROLS, 4, 60);
            this.musicLinkLocation = new Rectangle(lt.X, lt.Y, rb.X - lt.X, rb.Y - lt.Y);
            renderer.Flush();
            return;
        }
        for (const [x, y] of this.stars) {
            renderer.GoTo(x, y);
            renderer.HLine(Game.starPen, 48);
        }
        for (const e of this.entities) {
            e.Draw(renderer);
        }
        this.ship?.Draw(renderer);
        let scoreText: string = `Score:     ${String(Math.floor(this.score)).padStart(8)}`;
        if (this.Settings.Highscore > 0) {
            scoreText += `\nHighscore: ${String(this.Settings.Highscore).padStart(8)}`;
        }
        textRenderer.Draw(scoreText, 4, 4);
        if (!this.running) {
            if (this.blinkTimer < 500) {
                textRenderer.Draw("Press \\b()R\\n() to start", 4, this.Height - 24);
            }
            textRenderer.Draw("Press \\b()H\\n() for help", this.Width - 180, this.Height - 24);
        }
        if (this.paused) {
            textRenderer.Draw("Paused", this.Width / 2 - 51, this.Height / 2 - 5);
        }
        if (!this.paused && this.showingFps) {
            if (this.intervals.length > 0 ) {
                let fps: number = 1000 * this.intervals.length / this.intervals.reduce(
                    (acc: number, val: number): number => acc + val,
                    0
                );
                textRenderer.Draw(`${Math.round(fps)} fps`, 4, this.Height - 43);
            }
            textRenderer.Draw(`${renderer.DrawnLineCount} lines`, 4, this.Height - 62);
        }
        renderer.Flush();
    }

    Step(elapsedTime: number): void {
        if (this.paused || this.showingInfo) {
            return;
        }
        this.shouldExplode = false;
        if (this.running) {
            this.ship?.Step(elapsedTime);
        }
        for (let i: number = 0; i < this.stars.length; ++i) {
            const star: [number, number] = this.stars[i];
            star[0] -= Math.round(elapsedTime / 2.0);
            if (star[0] < -47) {
                star[0] += this.Width;
                star[1] = Random.Next(this.Height);
            }
        }
        for (const e of this.entities) {
            e.Step(elapsedTime);
        }
        if (this.running && this.shouldExplode) {
            for (const m of this.entities.filter((e: IEntity): boolean => e instanceof Meteor)) {
                (<Meteor>m).Explode();
            }
            for (let i: number = 0; i < 200; ++i) {
                this.CreateFlames(Random.Next(this.Width), Random.Next(this.Height), 0, 1);
            }
        }
        this.Cleanup(this.entities);
        this.entities.push(...this.newEntities);
        this.newEntities.length = 0;
        this.meteorTimer = Math.max(0, this.meteorTimer - elapsedTime);
        if (this.meteorTimer == 0) {
            this.entities.push(new Meteor(this));
            this.meteorTimer = this.minMeteorInterval + Random.Next(this.minMeteorInterval / 2);
            if (this.running && this.minMeteorInterval > 150)
                this.minMeteorInterval -= 4;
        }
        this.blinkTimer = (this.blinkTimer + elapsedTime) % 1000;
        if (this.running) {
            this.scoreTimer += elapsedTime;
            this.score += this.scoreTimer / 50;
            this.scoreTimer %= 50;
            this.pickupTimer = Math.max(0, this.pickupTimer - elapsedTime);
            if (this.pickupTimer == 0) {
                this.entities.push(new Pickup(this));
                this.pickupTimer = 8000 + Random.Next(4000);
            }
        }
        if (this.intervals.length < INTERVAL_COUNT) {
            this.intervals.push(elapsedTime);
        } else {
            this.intervals[this.intervalIndex] = elapsedTime;
            this.intervalIndex = (this.intervalIndex + 1) % INTERVAL_COUNT;
        }
    }

    private Cleanup<T extends IEntity>(list: Array<T>): void {
        let nextFree: number = 0;
        for (let i: number = 0; i < list.length; ++i) {
            if (!list[i].Dead) {
                if (nextFree != i) {
                    list[nextFree] = list[i];
                }
                ++nextFree;
            }
        }
        if (nextFree < list.length) {
            list.length = nextFree;
        }
    }

    AddScore(ammount: number): void {
        this.score += ammount;
    }

    CreateShot(x: number, y: number): void {
        this.newEntities.push(new Shot(x, y, this));
    }

    CreateFlames(x: number, y: number, radius: number, count: number): void {
        for (let i: number = 0; i < count; ++i) {
            const d: number = Random.Next(radius + 1);
            if (d == 0) {
                this.newEntities.push(new Flame(x, y));
            } else {
                const a: number = Random.Next(360) * Math.PI / 180.0;
                this.newEntities.push(
                    new Flame(x + Math.round(d * Math.cos(a)), y + Math.round(d * Math.sin(a)))
                );
            }
        }
    }

    CreateSparkles(x: number, y: number, radius: number, count: number): void {
        for (let i: number = 0; i < count; ++i) {
            const d: number = Random.Next(radius + 1);
            if (d == 0) {
                this.newEntities.push(new Sparkle(x, y));
            } else {
                const a: number = Random.Next(360) * Math.PI / 180.0;
                this.newEntities.push(
                    new Sparkle(x + Math.round(d * Math.cos(a)), y + Math.round(d * Math.sin(a)))
                );
            }
        }
    }

    public TogglePause(): void {
        this.paused = this.running && !this.paused;
    }

    public Explode(): void {
        this.shouldExplode = true;
    }

    End(): void {
        this.running = false;
        if (this.score > this.Settings.Highscore) {
            this.Settings.Highscore = Math.floor(this.score);
        }
    }

    public PressKey(key: string): void {
        this.Keyboard.PressKey(key);
        switch (key) {
            case "R":
                if (!this.running && !this.showingInfo) {
                    this.Reset();
                }
                break;
            case "P":
                if (!this.showingInfo) {
                    this.TogglePause();
                }
                break;
            case "M":
                if (this.Settings.PlayMusic) {
                    this.soundPlayer.pause();
                    this.Settings.PlayMusic = false;
                } else {
                    // noinspection JSIgnoredPromiseFromCall
                    this.soundPlayer.play();
                    this.Settings.PlayMusic = true;
                }
                break;
            case "F":
                this.showingFps = !this.showingFps;
                break;
            case "H":
                this.showingInfo = !this.showingInfo;
                break;
        }
    }

    public ReleaseKey(key: string): void {
        this.Keyboard.ReleaseKey(key);
    }

    public PressMouseButton(button: number): void {
        this.Mouse.PressMouseButton(button);
        if (button === 0 && this.musicLinkLocation.Contains(this.Mouse.Location)) {
            const link: HTMLAnchorElement = document.createElement("a");
            link.href = "http://teknoaxe.com/Link_Code_3.php?q=1023";
            link.target = "_blank";
            link.click();
        }
    }

    public ReleaseMouseButton(button: number): void {
        this.Mouse.ReleaseMouseButton(button);
    }

    public MoveMouse(location: Point): void {
        this.Mouse.MoveMouse(location);
    }
}
