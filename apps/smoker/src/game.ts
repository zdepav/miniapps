import { loadImageAsset } from '@common/assets';
import MiniApp from "@common/MiniApp";


interface Point {
    x: number;
    y: number;
    size: number;
}


class Projectile {
    pos: Point;
    dir: Point;

    isExpired(): boolean {
        return this.pos.x > 832 || this.pos.x < -32 || this.pos.y > 672 || this.pos.y < -32;
    }

    constructor(x: number, y: number, size: number, dx: number, dy: number, dsize: number) {
        this.pos = { x: x, y: y, size: size };
        this.dir = { x: dx, y: dy, size: dsize };
    }

    step(time: number): void {
        this.pos.x += this.dir.x * time;
        this.pos.y += this.dir.y * time;
        this.pos.size += this.dir.size * time;
    }
}


class Projectiles {
    items: Projectile[];

    get count(): number { return this.items.length }

    constructor() {
        this.items = [];
    }

    add(item: Projectile): void {
        if (this.count === this.items.length) {
            this.items.push(item);
        } else {
            this.items[this.items.length] = item;
        }
    }

    step(time: number): void {
        if (this.items.length === 0) {
            return;
        }
        for (let i: number = 0; i < this.count; ++i) {
            this.items[i].step(time);
        }
        let j: number = this.count;
        for (let i: number = 0; i < j;) {
            let item: Projectile = this.items[i];
            if (item.isExpired()) {
                --j;
                if (i < j) {
                    this.items[i] = this.items[j];
                }
                this.items.pop();
            } else {
                ++i;
            }
        }
    }

    clear(): void {
        if (this.items.length > 0) {
            this.items.splice(0, this.items.length);
        }
    }
}


let textures: Record<string, HTMLImageElement> = {}
async function loadTexture(name: string): Promise<void> {
    textures[name] = await loadImageAsset(`smoker/img/smoker-${name}.png`);
}


function sqr(n: number): number { return n * n; }


function clamp(value: number, min: number, max: number): number {
    return value > max ? max : value < min ? min : value;
}


let started: boolean = false;
let time: number = 0;
let prevDate: number = new Date().getTime();
let player: { x: number; y: number } = { x: -1, y: -1 };
let projectilesSpawned: number = 0;
let projectiles: Projectiles = new Projectiles();
let keyboard: Record<string, boolean> = {};
let terminated: boolean = false;
function main(canvas: HTMLCanvasElement): void {
    let ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;
    ctx.fillStyle = '#404040';
    ctx.fillRect(0, 0, 800, 640);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#800000';
    ctx.fillStyle = '#808080';
    ctx.font = '96px sans-serif';
    ctx.fillText('SMOKER', 400, 160);
    ctx.strokeText('SMOKER', 400, 160);
    ctx.fillStyle = '#FFF0E0';
    ctx.font = '64px sans-serif';
    ctx.fillText('click to start', 400, 320);
    ctx.fillStyle = '#C0C0C0';
    ctx.textAlign = 'left';
    ctx.font = '24px sans-serif';
    ctx.fillText('WASD or arrow keys to move', 16, 536);
    ctx.fillText('shift to slow down', 16, 572);
    ctx.fillText('avoid the smoke', 16, 608);
    ctx.textAlign = 'center';
    let hp: number = 5;
    function frame(): void {
        if (terminated) {
            return;
        }
        let date: number = new Date().getTime();
        let timeDiff: number = Math.min(date - prevDate, 1000) / 1000;
        time += timeDiff;
        prevDate = date;
        if (time > 60) {
            ctx.fillStyle = '#408040';
            ctx.fillRect(0, 0, 800, 640);
            ctx.fillStyle = '#E0FFE0';
            ctx.font = '64px sans-serif';
            ctx.fillText('YOU WON', 400, 320);
            ctx.font = '32px sans-serif';
            ctx.fillText('click to restart', 400, 480);
            started = false;
            return;
        }
        let flamePos: number = 104 + 216 * (1 - time / 60);
        projectiles.step(timeDiff);
        while (projectilesSpawned / 20 < time) {
            let d: number = Math.random() * Math.PI * 2;
            let s: number = 128 + 256 * time / 60;
            let p: Projectile = new Projectile(
                flamePos, 304 + Math.random() * 32, 16,
                s * Math.cos(d), -s * Math.sin(d), 8 + 16 * time / 60
            );
            p.step(time - projectilesSpawned / 20);
            projectiles.add(p);
            ++projectilesSpawned;
        }
        let dir: { x: number; y: number; s: number } = { x: 0, y: 0, s: 256 };
        if (keyboard['KeyW'] || keyboard['ArrowUp']) { --dir.y; }
        if (keyboard['KeyA'] || keyboard['ArrowLeft']) { --dir.x; }
        if (keyboard['KeyS'] || keyboard['ArrowDown']) { ++dir.y; }
        if (keyboard['KeyD'] || keyboard['ArrowRight']) { ++dir.x; }
        if (keyboard['ShiftLeft'] || keyboard['ShiftRight']) { dir.s *= 0.5; }
        if (dir.x != 0 && dir.y != 0) {
            let l: number = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
            dir.x /= l;
            dir.y /= l;
        }
        player.x = clamp(player.x + dir.x * timeDiff * dir.s, 6, 793);
        player.y = clamp(player.y + dir.y * timeDiff * dir.s, 6, 633);
        for (let p of projectiles.items) {
            if (sqr(p.pos.x - player.x) + sqr(p.pos.y - player.y) < sqr(6 + p.pos.size)) {
                p.pos.x = -100;
                p.pos.y = -100;
                --hp;
            }
        }
        if (hp <= 0) {
            ctx.fillStyle = '#804040';
            ctx.fillRect(0, 0, 800, 640);
            ctx.fillStyle = '#FFE0E0';
            ctx.font = '64px sans-serif';
            ctx.fillText('YOU DIED', 400, 320);
            ctx.font = '32px sans-serif';
            ctx.fillText('click to restart', 400, 480);
            started = false;
            return;
        }
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 800, 640);
        ctx.drawImage(textures['cigarette-burned'], 0, 304);
        ctx.drawImage(textures['cigarette'], 0, 0, flamePos, 32, 0, 304, flamePos, 32);
        ctx.drawImage(textures['flame'], flamePos - 1, 304);
        ctx.fillStyle = '#00C0C0';
        ctx.beginPath();
        ctx.arc(player.x, player.y, 6, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.fillStyle = '#80808080';
        for (let p of projectiles.items) {
            ctx.beginPath();
            ctx.arc(p.pos.x, p.pos.y, p.pos.size, 0, 2 * Math.PI, false);
            ctx.fill();
        }
        for (let i: number = 5; i > hp; --i) {
            ctx.drawImage(textures['smoke'], 0, 0, 800, 640);
        }
        requestAnimationFrame(frame);
    }
    canvas.setAttribute('tabindex', '0');
    canvas.focus();
    canvas.addEventListener('click', (): void => {
        if (!started) {
            started = true;
            hp = 5;
            time = 0;
            player = { x: 700, y: 320 };
            projectilesSpawned = 0;
            prevDate = new Date().getTime();
            projectiles.clear();
            frame();
        }
    });
    canvas.addEventListener('keydown', (e: KeyboardEvent): void => {
        keyboard[e.code] = true;
    });
    canvas.addEventListener('keyup', (e: KeyboardEvent): void => {
        keyboard[e.code] = false;
    });
}

export async function initialize(app: MiniApp, canvas: HTMLCanvasElement): Promise<void> {
    app.onRemove((): void => { terminated = true; });
    await Promise.all([
        loadTexture('cigarette'),
        loadTexture('cigarette-burned'),
        loadTexture('flame'),
        loadTexture('smoke')
    ]);
    main(canvas);
}
