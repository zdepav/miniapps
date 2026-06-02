import MiniApp from "@common/MiniApp";
import "@/style.sass";


const APP: MiniApp = new MiniApp("tile-connect", { game: true, autoremove: true });
const CONTAINER: HTMLElement = APP.insertIntoPage();


function reset(): void {
    CONTAINER.innerHTML = "";
    const levelIndex: number = Math.floor(Math.random() * LEVELS.length);
    new Game(LEVELS[levelIndex]);
    buildScoresTable();
}


interface Score {
    str: string;
    value: number;
}


type TileType = "." | "i" | "I" | "L" | "T" | "+";


interface TileTemplate {
    type: TileType;
    className: string;
}


function getTileTemplate(directions: string, levelName: string): TileTemplate {
    switch (directions) {
        case "o":
            return { className: `tile ${directions}`, type: '.' };
        case "u":
        case "r":
        case "d":
        case "l":
            return { className: `tile ${directions} c`, type: 'i' };
        case "r u":
        case "d r":
        case "d l":
        case "l u":
            return { className: `tile ${directions}`, type: 'L' };
        case "l r":
        case "d u":
            return { className: `tile ${directions}`, type: 'I' };
        case "d r u":
        case "d l r":
        case "d l u":
        case "l r u":
            return { className: `tile ${directions}`, type: 'T' };
        case "d l r u":
            return { className: `tile ${directions}`, type: '+' };
        default:
            throw new Error(`Invalid level ${levelName} (invalid tile type: ${directions})`);
    }
}


class Game {
    readonly level: Level;
    readonly table: HTMLTableElement;
    private readonly header: HTMLElement;
    private readonly tiles: Array<Tile>;
    private readonly retryButton: HTMLElement;
    private readonly startTime: number;
    private timeoutId: any;
    private _won: boolean;

    get won(): boolean { return this._won; }

    constructor(level: Level) {
        this.level = level;
        this._won = false;
        this.table = document.createElement("table");
        this.table.classList.add("tiles");
        this.table.innerHTML = /* language=html */ `
          <thead>
              <tr><th colspan="${level.width}" class="level-name">${level.name}</th></tr>
              <tr><th colspan="${level.width}"><div class="header fullRow">00:00</div></th></tr>
          </thead>
          <tbody></tbody>
          <tfoot>
              <tr><td colspan="${level.width}"><div class="retry fullRow"></div></td></tr>
          </tfoot>
        `;
        CONTAINER.appendChild(this.table);
        this.startTime = 0;
        this.retryButton = this.table.querySelector(".retry")!;
        this.header = this.table.querySelector(".header")!;
        this.tiles = level.build(this, this.table.querySelector("tbody")!);
        this.timeoutId = setTimeout((): void => this.updateTime(), 100);
        this.startTime = performance.now();
        APP.onRemove((): void => clearTimeout(this.timeoutId));
    }

    checkWin(): void {
        if (this._won) {
            return;
        }
        for (const tile of this.tiles) if (!tile.check()) {
            return;
        }
        this.table.classList.add("won");
        this.retryButton.innerText = "Replay";
        this.retryButton.classList.add("retryButton");
        this.retryButton.addEventListener("click", reset);
        this._won = true;
    }

    updateTime(): void {
        const time: number = Math.floor(performance.now() - this.startTime);
        const seconds: number = Math.floor(time / 1000 % 60);
        const minutes: number = Math.floor(time / 60000 % 60);
        const hours: number = Math.floor(time / 3600000);
        let timeStr: string = hours > 0 ? hours + ":" : "";
        timeStr += minutes >= 10 ? minutes : "0" + minutes;
        timeStr += seconds >= 10 ? ":" + seconds : ":0" + seconds;
        this.header.innerText = timeStr;
        if (this.won) {
            this.level.addScore({ str: timeStr, value: time });
        } else {
            this.timeoutId = setTimeout((): void => this.updateTime(), 100);
        }
    }
}


class Tile {
    private _rotation: number;
    readonly game: Game;
    readonly element: HTMLElement;
    readonly type: TileType;

    set rotation(value: number) {
        this._rotation = value;
        this.element.style.transform = `rotate(${this._rotation * 90}deg)`;
    }

    get rotation(): number { return this._rotation; }

    constructor(game: Game, template: TileTemplate) {
        this._rotation = 1 + Math.floor(Math.random() * 3);
        this.game = game;
        this.element = document.createElement("div");
        this.element.className = template.className;
        this.element.style.transform = `rotate(${this._rotation * 90}deg)`;
        this.element.appendChild(document.createElement("div"));
        this.element.addEventListener("click", (): void => {
            if (this.game.won) {
                return;
            }
            ++this.rotation;
            this.game.checkWin();
        });
        this.type = template.type;
    }

    check(): boolean {
        switch (this.type) {
            case '.':
            case '+':
                return true;
            case 'I':
                return this.rotation % 2 === 0;
            default:
                return this.rotation % 4 === 0;
        }
    }
}


const WS_REGEX: RegExp = /\s+/g;


class Level {
    name: string;
    tiles: Array<Array<TileTemplate>>;
    scores: Array<Score>;
    saveId: string;

    get width(): number { return this.tiles[0].length; }

    get height(): number { return this.tiles.length; }

    constructor(name: string, tiles: Array<string>) {
        this.name = name;
        this.tiles = [];
        this.scores = [];
        this.saveId = `miniapps.TileConnect.${name}`;

        // validation and preprocessing
        const grid: Array<Array<string>> = tiles.map(
            (row: string): Array<string> => row.trim().split(WS_REGEX)
        );
        if (grid.length === 0 || grid[0].length === 0) {
            throw new Error(`Invalid level ${name}.`);
        }
        for (let y: number = 0; y < grid.length; ++y) {
            const row: Array<TileTemplate> = [];
            if (y > 0 && grid[y].length !== grid[0].length) {
                throw new Error(`Invalid level ${name} (not rectangular).`);
            }
            for (let x: number = 0; x < grid[y].length; ++x) {
                row.push(getTileTemplate(grid[y][x].trim().split('').sort().join(' '), this.name));
            }
            this.tiles.push(row);
        }

        // saved scores
        this.tryLoadScores();
    }

    tryLoadScores(): void {
        const saved: string | null = localStorage.getItem(this.saveId);
        if (saved == null) {
            return;
        }
        let parsed: any;
        try {
            parsed = JSON.parse(saved);
        } catch {
            return;
        }
        if (!Array.isArray(parsed)) {
            return;
        }
        for (const item of parsed) {
            if (
                item == null || typeof item !== 'object'
                || !('str' in item) || typeof item.str !== 'string'
                || !('value' in item) || !Number.isInteger(item.value) || item.value < 1000
            ) {
                continue;
            }
            this.scores.push(item);
        }
    }

    build(game: Game, tbody: HTMLTableSectionElement): Array<Tile> {
        const tiles: Array<Tile> = [];
        for (let y: number = 0; y < this.tiles.length; ++y) {
            const tr: HTMLTableRowElement = document.createElement("tr");
            for (const template of this.tiles[y]) {
                const td: HTMLTableCellElement = document.createElement("td");
                const tile: Tile = new Tile(game, template);
                td.appendChild(tile.element);
                tr.appendChild(td);
                tiles.push(tile);
            }
            tbody.appendChild(tr);
        }
        return tiles;
    }

    addScore(score: Score): void {
        this.scores.push(score);
        this.scores.sort((a: Score, b: Score): number => a.value - b.value);
        if (this.scores.length > 3) {
            this.scores.pop();
        }
        localStorage.setItem(this.saveId, JSON.stringify(this.scores));
    }
}


const LEVELS: Array<Level> = [
    new Level("Chaos", [
        "rd rdl dl d r ld dr dl", "urd udl urd urdl rdl ul du u", "u urd url ul ud d dru ld",
        "r url rdl l urd lur ul ud", "rd lr rlu rld rudl l dr dul", "ru lr lr lu ur lr lru lu"
    ]),
    new Level("Rooms", [
        "rd lr lrd lr lr lrd drl dl", "du d rdu rl rld rdlu ldu du",
        "dur rudl rul ld u ur dlru dul", "dur lru dl dur rl rld lu du",
        "du dr lru ulr ld rud rl dul", "ur lru rl rl rul rlu rl ul"
    ]),
    new Level("Loops", [
        "o o rd lr lr ld", "dr lr dulr lr dl ud", "ud dr lurd dl ud ud", "ud ud ur urld urld ul",
        "ud ur lr lu ud o", "ur lr lr lr ul o"
    ]),
    new Level("Easy", [
        "dr lr lrd lrd lrd ld", "udr l ud ud u ud", "dur lr lud ur lr lud", "ud d udr l rd ldu",
        "ud ud ud r lu ud", "ur url ulr lr lr ul"
    ]),
    new Level("Network", [
        "d d r lrd l r ld d", "ur lud r lud rd l rud lud", "r lurd lrd lur lurd lrd lud u",
        "d u rdu l u ud u d", "rdu lrd lu dr drl lur drl lud", "u u r lu ur l u u"
    ])
];


function buildScoresTable(): void {
    let count: number = 0;
    for (const level of LEVELS) {
        count = Math.max(count, level.scores.length);
    }
    if (count === 0) {
        return;
    }
    const scoreTable: HTMLTableElement = document.createElement("table");
    scoreTable.classList.add("scores");
    scoreTable.innerHTML = /* language=html */ `
        <thead>
            <tr><th colspan="${LEVELS.length}">Past scores</th></tr>
            <tr></tr>
        </thead>
        <tbody></tbody>
    `;
    const titleRow: HTMLTableRowElement = scoreTable.querySelector("thead tr:last-child")!;
    const tbody: HTMLTableSectionElement = scoreTable.querySelector("tbody")!;
    const rows: Array<HTMLTableRowElement> = [];
    for (let i: number = 0; i < count; ++i) {
        const tr: HTMLTableRowElement = document.createElement("tr");
        rows.push(tr);
        tbody.appendChild(tr);
    }
    for (const level of LEVELS) {
        const title: HTMLTableCellElement = document.createElement("th");
        title.innerText = level.name;
        titleRow.appendChild(title);
        for (let i: number = 0; i < count; ++i) {
            const td: HTMLTableCellElement = document.createElement("td");
            if (i < level.scores.length) {
                td.innerText = level.scores[i].str;
            }
            rows[i].appendChild(td);
        }
    }
    CONTAINER.appendChild(scoreTable);
}


CONTAINER.innerHTML = /* language=html */ `
    <div class="start-button-container">
        <div class="start-button">Start game</div>
    </div>
`;
buildScoresTable();
CONTAINER.querySelector(".start-button-container")!.addEventListener("click", reset);
