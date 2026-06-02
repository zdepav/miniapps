import MiniApp from "@common/MiniApp";


const app: MiniApp = new MiniApp("snail", { game: true, autoremove: true });
app.insertIntoPage();
app.container.style.display = "flex";
app.container.style.justifyContent = "center";
const canvas: HTMLCanvasElement = document.createElement("canvas");
canvas.width = 640;
canvas.height = 480;
app.container.appendChild(canvas);
const draw: CanvasRenderingContext2D = canvas.getContext("2d")!;


class Color {
    r: number;
    g: number;
    b: number;
    a: number;

    constructor(_r?: number, _g?: number, _b?: number, _a?: number) {
        this.r = _r == null || _r < 0 ? 0 : _r > 255 ? 255 : _r;
        this.g = _g == null || _g < 0 ? 0 : _g > 255 ? 255 : _g;
        this.b = _b == null || _b < 0 ? 0 : _b > 255 ? 255 : _b;
        this.a = _a == null || _a < 0 ? 0 : _a > 255 ? 1 : _a / 255;
    }

    /** Get color data in rgba(r, g, b, a) format */
    rgba(): string {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
}


class Tree {
    x: number;
    y: number;
    color1: Color;
    color2: Color;
    color3: Color;

    constructor(snail: Snail) {
        this.x = Math.floor(Math.random() * 640);
        this.y = Math.floor(Math.random() * 480);
        while (snail.InCollisionWith(this.x, this.y, 8)) {
            this.x = Math.floor(Math.random() * 640);
            this.y = Math.floor(Math.random() * 480);
        }
        this.color1 = new Color(
            Math.floor(Math.random() * 96),
            Math.floor(Math.random() * 128) + 96,
            0,
            255
        );
        this.color2 = new Color(this.color1.r + 56, Math.min(this.color1.g + 56, 255), 56, 255);
        this.color3 = new Color(this.color1.r + 80, Math.min(this.color1.g + 80, 255), 80, 255);
    }

    Draw(): void {
		const circle_gradient: CanvasGradient = draw.createRadialGradient(
            this.x - 6, this.y - 6, 1,
            this.x, this.y, 32
        );
		circle_gradient.addColorStop(0, this.color3.rgba());
		circle_gradient.addColorStop(0.5, this.color2.rgba());
		circle_gradient.addColorStop(1, this.color1.rgba());
		draw.fillStyle = circle_gradient;
		draw.beginPath();
		draw.arc(this.x, this.y, 32, 0, 2 * Math.PI);
		draw.closePath();
		draw.fill();
    }
}


class Stone {
    x: number;
    y: number;
    color: Color;
    shape: Array<number>;

    constructor() {
        this.x = Math.floor(Math.random() * 640);
        this.y = Math.floor(Math.random() * 480);
        let c: number = Math.floor(Math.random() * 128) + 96;
        this.color = new Color(c, c, c, 255);
        let shapeDirs: Array<number> = [];
        for (let i: number = 0; i < 8; ++i) {
            shapeDirs.push(Math.floor(Math.random() * 360));
        }
        shapeDirs.sort((a: number, b: number): number => a - b);
        this.shape = [];
        for (let i: number = 0; i < 8; ++i) {
            this.shape.push(
                this.x + 16 * Math.sin(shapeDirs[i] / 180 * Math.PI),
                this.y + 16 * (-Math.cos(shapeDirs[i] / 180 * Math.PI))
            );
        }
    }

    Draw(): void {
		draw.fillStyle = this.color.rgba();
		draw.beginPath();
		draw.moveTo(this.shape[0], this.shape[1]);
		for (let g: number = 2; g < 16; g += 2) {
			draw.lineTo(this.shape[g], this.shape[g + 1]);
        }
		draw.closePath();
		draw.fill();
    }
}


interface Mushroom {
    x: number;
    y: number;
    points: number;

    doBonus(snail: Snail): void;

	Step(): void;

	Draw(): void;
}


class RedMushroom implements Mushroom {
    x: number;
    y: number;
    points: number;
    whitePoints: Array<number>;
    wpc: number;

    constructor() {
        this.x = Math.floor(Math.random() * 640);
        this.y = Math.floor(Math.random() * 480);
        this.points = 0;
        this.whitePoints = [];
        this.wpc = 4 + Math.floor(Math.random() * 6);
        let l, d;
        for (let i: number = 0; i < this.wpc; i++) {
            l = Math.floor(Math.random() * 6);
            d = Math.floor(Math.random() * 360) * Math.PI / 180;
            this.whitePoints[i * 2] = this.x + Math.floor(l * Math.sin(d));
            this.whitePoints[i * 2 + 1] = this.y - Math.floor(l * Math.cos(d));
        }
    }

    doBonus(snail: Snail): void {
		const ChangeIndex: number = snail.relSize >= 2.5 ? 1 : 0.2 + (snail.relSize - 0.5) / 2.5;
		snail.lowSpeed = ChangeIndex;
		snail.highSpeed = 3 * ChangeIndex;
		snail.speedTimer = 180;
	}

	Step(): void { }

	Draw(): void {
		const circle_gradient: CanvasGradient = draw.createRadialGradient(
            this.x - 1, this.y - 1, 1,
            this.x, this.y, 6
        );
		circle_gradient.addColorStop(0, "#FF6060");
		circle_gradient.addColorStop(1, "#FF0000");
		draw.fillStyle = circle_gradient;
		draw.beginPath();
		draw.arc(this.x, this.y, 6, 0, Math.PI * 2);
		draw.closePath();
		draw.fill();
		draw.fillStyle = "#FFFFFF";
		for (let i: number = 0; i < this.wpc; i++) {
			draw.fillRect(this.whitePoints[i * 2], this.whitePoints[i * 2 + 1], 1, 1);
        }
	}
}


class BrownMushroom implements Mushroom {
    x: number;
    y: number;
    points: number;

    constructor() {
        this.x = Math.floor(Math.random() * 640);
        this.y = Math.floor(Math.random() * 480);
        this.points = 5;
    }

	doBonus(): void {}

	Step(): void {}

	Draw(): void {
		const circle_gradient: CanvasGradient = draw.createRadialGradient(
            this.x - 1, this.y - 1, 1,
            this.x, this.y, 6
        );
		circle_gradient.addColorStop(0, "#FFC060");
		circle_gradient.addColorStop(1, "#C06020");
		draw.fillStyle = circle_gradient;
		draw.beginPath();
		draw.arc(this.x, this.y, 6, 0, Math.PI * 2);
		draw.closePath();
		draw.fill();
	}
}


class PurpleMushroom implements Mushroom {
    x: number;
    y: number;
    points: number;
    rNow: number;
    color1: Color;
    color2: Color;

    constructor() {
        this.x = Math.floor(Math.random() * 640);
        this.y = Math.floor(Math.random() * 480);
        this.points = Math.floor(Math.random() * 10);
        const g1: number = Math.floor(Math.random() * 64);
        this.rNow = Math.floor(Math.random() * 360);
        this.color1 = new Color(255, g1, 255, 255);
        this.color2 = new Color(255, 0, 255, 255);
    }

	doBonus(snail: Snail): void{
		switch (Math.floor(Math.random() * 5)) {
			case 0:
				snail.color.a = 0.01;
				snail.color2.a = 0.01;
				snail.alphaTimer = 360;
				break;
			case 1:
				if (snail.relSize > 0.5) {
					snail.relSize -= 0.1;
                }
				break;
		}
	}

	Step(): void{
		this.rNow++;
		this.rNow %= 360;
		this.color1.r = 191 + Math.floor(64 * Math.sin(this.rNow * Math.PI / 180));
		this.color2.r = this.color1.r - 32;
	}

	Draw(): void{
		const circle_gradient: CanvasGradient = draw.createRadialGradient(
            this.x - 1, this.y - 1, 1,
            this.x, this.y, 6
        );
		circle_gradient.addColorStop(0, this.color1.rgba());
		circle_gradient.addColorStop(1, this.color2.rgba());
		draw.fillStyle = circle_gradient;
		draw.beginPath();
		draw.arc(this.x, this.y, 6, 0, Math.PI * 2);
		draw.closePath();
		draw.fill();
	}
}


interface Flower {
    x: number;
    y: number;
    points: number;

	Draw(): void;
}


class WhiteFlower implements Flower {
    x: number;
    y: number;
    points: number;

    constructor() {
        this.x = Math.floor(Math.random() * 640);
        this.y = Math.floor(Math.random() * 480);
        this.points = 8;
    }

	Draw(): void {
		draw.strokeStyle = "#FFFFFF";
		draw.beginPath();
		for (let d: number = 0; d < 10; d++) {
			draw.moveTo(this.x, this.y);
			draw.lineTo(
                this.x + 6 * Math.sin(d * 36 * Math.PI / 180),
                this.y - 6 * Math.cos(d * 36 * Math.PI / 180)
            );
		}
		draw.closePath();
		draw.stroke();

		draw.fillStyle = "#FFFF00";
		draw.beginPath();
		draw.arc(this.x, this.y, 2, 0, Math.PI * 2);
		draw.closePath();
		draw.fill();
	}
}


class GoldFlower implements Flower {
    x: number;
    y: number;
    points: number;

    constructor() {
        this.x = Math.floor(Math.random() * 640);
        this.y = Math.floor(Math.random() * 480);
        this.points = 1;
    }

    Draw(): void {
		draw.strokeStyle = "#FFC000";
		draw.beginPath();
		for (let d: number = 0; d < 10; d++) {
			draw.moveTo(this.x, this.y);
			draw.lineTo(
                this.x + 6 * Math.sin(d * 36 * Math.PI / 180),
                this.y - 6 * Math.cos(d * 36 * Math.PI / 180)
            );
		}
		draw.closePath();
		draw.stroke();

		draw.fillStyle = "#FF4000";
		draw.beginPath();
		draw.arc(this.x, this.y, 2, 0, Math.PI * 2);
		draw.closePath();
		draw.fill();
	}
}


class Snail {
    x: number;
    y: number;
    direction: number;
    color: Color;
    color2: Color;
    relSize: number;
    highSpeed: number;
    lowSpeed: number;
    alphaTimer: number;
    speedTimer: number;

    constructor() {
        this.x = Math.floor(Math.random() * 600 + 20);
        this.y = Math.floor(Math.random() * 440 + 20);
        this.direction = Math.floor(Math.random() * 360);
        this.color = new Color(255, 192, 128, 255);
        this.color2 = new Color(192, 192, 192, 255);
        this.relSize = 0.5;
        this.highSpeed = 3;
        this.lowSpeed = 1;
        this.alphaTimer = 0;
        this.speedTimer = 0;
    }

	Move(_trees: Array<Tree>, _stones: Array<Stone>){
		const absSize: number = 16 * this.relSize;

		// Timers
        if (this.alphaTimer > 1) {
            this.alphaTimer--;
        } else if(this.alphaTimer == 1) {
            this.color.a = 1;
            this.color2.a = 1;
            this.alphaTimer = 0;
        }
        if (this.speedTimer > 1) {
            this.speedTimer--;
        } else if (this.speedTimer == 1) {
            this.highSpeed = 3;
            this.lowSpeed = 1;
            this.speedTimer = 0;
        }

        // Movement
        if (game.keys.A) {
            this.direction -= 3;
        }
        if (game.keys.D) {
            this.direction += 3;
        }
        if (game.keys.W || game.keys.S){
            let isOnStone: boolean = false;
            if (this.relSize < 2.5) {
                for (const stone of _stones) if (this.InCollisionWith(stone.x, stone.y, 16)) {
                    isOnStone = true;
                    break;
                }
            }
            const px: number = this.x;
            const py: number = this.y;
            this.x += (
                game.keys.W
                    ? (isOnStone ? this.lowSpeed : this.highSpeed)
                    : (isOnStone ? -this.lowSpeed : -this.highSpeed)
            ) * Math.sin(this.direction / 180 * Math.PI);
            if (this.x > 640 - absSize) {
                this.x = px - 0.1;
            } else if(this.x < absSize) {
                this.x = px + 0.1;
            }
            this.y += (
                game.keys.W
                    ? (isOnStone ? this.lowSpeed : this.highSpeed)
                    : (isOnStone ? -this.lowSpeed : -this.highSpeed)
            ) * (-Math.cos(this.direction / 180 * Math.PI));
            if(this.y > 480 - absSize) {
                this.y = py - 0.1;
            } else if(this.y < absSize) {
                this.y = py + 0.1;
            }
            if (this.CollisionTrees(_trees, true)) {
                this.x = px;
                this.y = py;
            }
        }
    }

	Draw(): void {
		draw.fillStyle = this.color.rgba();
		draw.beginPath();
		const absSize: number = 16 * this.relSize;
		draw.moveTo(
		    this.x + absSize * Math.sin((this.direction + 30) / 180 * Math.PI),
		    this.y + absSize * (-Math.cos((this.direction + 30) / 180 * Math.PI))
        );
		draw.lineTo(
		    this.x + absSize * Math.sin((this.direction + 150) / 180 * Math.PI),
		    this.y + absSize * (-Math.cos((this.direction + 150) / 180 * Math.PI))
        );
		draw.lineTo(
		    this.x + absSize * Math.sin((this.direction + 210) / 180 * Math.PI),
		    this.y + absSize * (-Math.cos((this.direction + 210) / 180 * Math.PI))
        );
		draw.lineTo(
		    this.x + absSize * Math.sin((this.direction + 330) / 180 * Math.PI),
		    this.y + absSize * (-Math.cos((this.direction + 330) / 180 * Math.PI))
        );
		draw.closePath();
		draw.fill();
		draw.fillStyle = this.color2.rgba();
		draw.beginPath();
		draw.arc(
            this.x + 6 * this.relSize * Math.sin((this.direction + 180) / 180 * Math.PI),
            this.y + 6 * this.relSize * (-Math.cos((this.direction + 180) / 180 * Math.PI)),
            12 * this.relSize,
            0,
            Math.PI * 2
        );
		draw.closePath();
		draw.fill();
	}

	/** collision check */
	InCollisionWith(x: number, y: number, r: number): boolean {
		return (
            Math.pow(Math.abs(x - this.x), 2) + Math.pow(Math.abs(y - this.y), 2)
        ) < Math.pow(16 * this.relSize + r, 2);
	}

	/** collisions with trees */
	CollisionTrees(trees: Array<Tree>, bool: boolean): boolean {
		for (let t: number = 0; t < trees.length; ++t) {
			if (this.InCollisionWith(trees[t].x, trees[t].y, 8)) {
				if (this.relSize > 2 && bool) {
					game.score += 50;
					game.scoreLevel += 50;
					trees.splice(t, 1);
					--t;
				} else {
					return true;
                }
			}
		}
		return false;
	}

	Grow(): void {
		this.relSize += 0.1;
	}
}


class Game {
    health: number;
    score: number;
    scoreLevel: number;
    scoreLevelMax: number;
    scoreLevelActual: number;
    scoreBarColorState: number;
    scoreBarColor: Color;
    scoreBarBubles: Array<number>;
    trees: Array<Tree>;
    stones: Array<Stone>;
    mushrooms: Array<Mushroom>;
    flowers: Array<Flower>;
    player: Snail;
    keys: Record<string, boolean>;

    constructor() {
        this.health = 100;
        this.score = 0;
        this.scoreLevel = 0;
        this.scoreLevelMax = 10;
        this.scoreLevelActual = 1;
        this.scoreBarColorState = Math.floor(Math.random() * 360);
        this.scoreBarColor = new Color(0, 0, 255, 255);
        this.scoreBarBubles = [];
        this.trees = [];
        this.stones = [];
        this.mushrooms = [];
        this.flowers = [];
        this.player = new Snail();
        this.keys = {};

        const ua: string = navigator.userAgent.toLowerCase();
        if (ua.indexOf("android") > -1 || ua.indexOf("mobile") > -1) {
            const keyboard: HTMLElement = <HTMLElement>document.getElementById("keyboard");
            keyboard.addEventListener("keydown", (e: KeyboardEvent): void => {
                const key: string = e.key.toUpperCase();
                this.keys[key] = !this.keys[key];
            });
        } else {
            document.body.addEventListener("keydown", (e: KeyboardEvent): void => {
                this.keys[e.key.toUpperCase()] = true;
            });
            document.body.addEventListener("keyup", (e: KeyboardEvent): void => {
                this.keys[e.key.toUpperCase()] = false;
            });
        }
        // score bar bubles
        for (let i: number = 0; i < 44; i += 2) {
            this.scoreBarBubles.push(i + 1, Math.floor(Math.random() * 10));
        }
        // trees
        for (let i: number = 0; i < 25; ++i) {
            this.trees.push(new Tree(this.player));
        }
        // stones
        for (let i: number = 0; i < 15; ++i) {
            this.stones.push(new Stone());
        }
        // mushrooms
        for (let i: number = 0; i < 8; ++i) {
            this.mushrooms.push(new RedMushroom());
        }
        for (let i: number = 8; i < 16; ++i) {
            this.mushrooms.push(new BrownMushroom());
        }
        for (let i: number = 16; i < 20; ++i) {
            this.mushrooms.push(new PurpleMushroom());
        }
        // flowers
        for (let i: number = 0; i < 8; ++i) {
            this.flowers.push(new WhiteFlower());
        }
        for (let i: number = 8; i < 256; ++i) {
            this.flowers.push(new GoldFlower());
        }
    }

    Step(): void {
        /// collect mushrooms
        for (let x: number = 0; x < this.mushrooms.length; ++x) {
            this.mushrooms[x].Step();
            if (this.player.InCollisionWith(this.mushrooms[x].x, this.mushrooms[x].y, 6)) {
                this.score += this.mushrooms[x].points;
                this.scoreLevel += this.mushrooms[x].points;
                this.mushrooms[x].doBonus(this.player);
                if(this.mushrooms[x] instanceof RedMushroom) {
                    this.mushrooms[x] = new RedMushroom();
                } else if(this.mushrooms[x] instanceof BrownMushroom) {
                    this.mushrooms[x] = new BrownMushroom();
                } else if(this.mushrooms[x] instanceof PurpleMushroom) {
                    this.mushrooms[x] = new PurpleMushroom();
                }
                --x;
            }
        }
        /// collect flowers
        for (let x: number = 0; x < this.flowers.length; ++x) {
            if (this.player.InCollisionWith(this.flowers[x].x, this.flowers[x].y, 6)) {
                this.score += this.flowers[x].points;
                this.scoreLevel += this.flowers[x].points;
                if (this.flowers[x] instanceof WhiteFlower) {
                    this.flowers[x] = new WhiteFlower();
                } else if (this.flowers[x] instanceof GoldFlower) {
                    this.flowers[x] = new GoldFlower();
                }
                --x;
            }
        }
        if (this.scoreLevel > this.scoreLevelMax) {
            this.scoreLevel -= this.scoreLevelMax;
            this.scoreLevelMax += 10;
            this.scoreLevelActual++;
            this.player.Grow();
        }
        for (let i: number = 0; i < 44; i += 2) {
            this.scoreBarBubles[i + 1] -= 0.25;
            if (this.scoreBarBubles[i + 1] < 0) {
                this.scoreBarBubles[i] = Math.floor(Math.random() * 22 * 2 + 1);
                this.scoreBarBubles[i + 1] = 10;
            }
        }
        ++this.scoreBarColorState;
        this.scoreBarColorState %= 360;
        this.scoreBarColor.g = Math.floor(
            112 + Math.sin(this.scoreBarColorState * 3.1415 / 180) * 48
        );
        this.player.Move(this.trees, this.stones);
    }

    Draw(): void {
        draw.fillStyle = "#804000";
        draw.fillRect(0, 0, 640, 480);
        for (const stone of this.stones) {
            stone.Draw();
        }
        for (const mushroom of this.mushrooms) {
            mushroom.Draw();
        }
        for (const flower of this.flowers) {
            flower.Draw();
        }
        this.player.Draw();
        for (const tree of this.trees) {
            tree.Draw();
        }
        draw.fillStyle = "#FFFF80";
        draw.font = "12px sans-serif";
        draw.fillText("Score: " + this.score, 2, 12);

        /// level bar
        draw.strokeStyle = "#00FFC0";
        draw.fillStyle = "#00FFC0";
        draw.strokeRect(0, 16, 48, 12);
        draw.fillText(this.scoreLevelActual.toString(), 50, 26);
        let barWidth: number = Math.round(this.scoreLevel / this.scoreLevelMax * 46);
        draw.fillStyle = this.scoreBarColor.rgba();
        draw.fillRect(1, 17, barWidth, 10);
        barWidth -= 2;
        draw.fillStyle = "#00FFFF";
        for (let i: number = 0; i < 44; i += 2) if (this.scoreBarBubles[i] <= barWidth) {
            draw.fillRect(1 + this.scoreBarBubles[i], 17 + this.scoreBarBubles[i + 1], 1, 1);
        }
    }
}


const game: Game = new Game();
let terminated: boolean = false;


function loop(): void {
    if (terminated) {
        return;
    }
    requestAnimationFrame(loop);
	game.Step();
	game.Draw();
}


function start(): void {
    canvas.removeEventListener('click', start);
    loop();
}


draw.save();
draw.fillStyle = "#804000";
draw.fillRect(0, 0, 640, 480);
draw.textAlign = "center";
draw.textBaseline = "middle";
draw.fillStyle = "#FFC080";
draw.font = "96px sans-serif";
draw.fillText("Snail", 320, 160);
draw.fillStyle = "#FFFF80";
draw.font = "24px sans-serif";
draw.fillText("click to start", 320, 300);
draw.fillText("WASD to move", 320, 340);
draw.restore();
canvas.addEventListener('click', start);
app.onRemove((): void => { terminated = true; });
