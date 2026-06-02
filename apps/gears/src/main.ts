import MiniApp from "@common/MiniApp";
import "@/style.sass"


function $e<T extends HTMLElement>(
    parent: HTMLElement,
    tag: string,
    callback: (elem: T) => void | null | undefined
): T {
    const elem: T = document.createElement(tag) as T;
    if (callback != null) {
        callback(elem);
    }
    parent.appendChild(elem);
    return elem;
}


function $i(
    parent: HTMLElement,
    label: string,
    type: string,
    value: any,
    onChange: ((value: string) => boolean | void) | ((checked: boolean) => void)
): HTMLInputElement {
    let inp: HTMLInputElement;
    $e(parent, "label", (outer: HTMLElement): void => {
        outer.appendChild(document.createTextNode(label + ":"));
        $e(outer, "input", (input: HTMLInputElement): void => {
            inp = input;
            input.classList.add(type);
            if (type == "checkbox") {
                input.type = type;
                input.checked = !!value;
                input.addEventListener(
                    "change",
                    (): boolean | void => (<(_: boolean) => void>onChange)(input.checked)
                );
            } else {
                input.type = "text";
                input.value = String(value);
                input.addEventListener("input", (): void => {
                    const valid: boolean | undefined = <boolean | undefined>(
                        <(_: string) => boolean | void>onChange
                    )(input.value);
                    input.setCustomValidity(valid == null || valid ? "" : "Invalid");
                });
            }
        });
    });
    return inp!;
}


const INT_REGEX: RegExp = /^-?[0-9]+$/;


function $int(
    parent: HTMLElement,
    label: string,
    value: number,
    onChange: (value: number) => boolean | void
): HTMLInputElement {
    return $i(parent, label, "number", String(value), (str: string): boolean | void => {
        if (!INT_REGEX.test(str)) {
            return false;
        }
        const val: number = parseInt(str);
        return Number.isNaN(val) ? false : onChange(val);
    });
}


const COLOR_REGEX: RegExp = /^(#([a-f\d]{3}|[a-f\d]{6})|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\))$/i;


function $color(
    parent: HTMLElement,
    label: string,
    color: string,
    onChange: (color: string) => boolean | void
): HTMLInputElement {
    return $i(parent, label, "color", color, (str: string): boolean | void => {
        return COLOR_REGEX.test(str) && onChange(str);
    });
}


// configuration
let OUTER_RADIUS: number = 300;
let SIZE: number = OUTER_RADIUS + OUTER_RADIUS;
let CENTER: number = OUTER_RADIUS;
let GEAR_RADIUS: number = 120;
let HOLE_DISTANCE: number = 80;
let LINE_WIDTH: number = 4;
let BG_COLOR: string = "#111";
let COLOR: string = "#fff";
let SHOW_BG: boolean = true;
let SHOW_GEAR: boolean = false;


const container: HTMLElement = new MiniApp("gears", {
    themed: true,
    autoremove: true
}).insertIntoPage();
$e(container, "section", (section: HTMLElement): void => {
    section.classList.add("inputs");
    $int(section, "Outer radius", OUTER_RADIUS, (value: number): void => {
        OUTER_RADIUS = value;
        update();
    });
    $int(section, "Gear radius", GEAR_RADIUS, (value: number): void => {
        GEAR_RADIUS = value;
        update();
    });
    $int(section, "Hole distance", HOLE_DISTANCE, (value: number): void => {
        HOLE_DISTANCE = value;
        update();
    });
});
$e(container, "section", (section: HTMLElement): void => {
    section.classList.add("inputs");
    $color(section, "Line color", COLOR, (value: string): void => {
        COLOR = value;
        update();
    });
    $int(section, "Line width", LINE_WIDTH, (value: number): void => {
        LINE_WIDTH = value;
        update();
    });
    $i(section, "Show background", "checkbox", SHOW_BG, (value: boolean): void => {
        SHOW_BG = value;
        update();
    });
    $color(section, "Background color", BG_COLOR, (value: string): void => {
        BG_COLOR = value;
        update();
    });
});
$e(container, "section", (section: HTMLElement): void => {
    section.classList.add("inputs");
    $i(section, "Show gear", "checkbox", SHOW_GEAR, (value: boolean): void => {
        SHOW_GEAR = value;
        update();
    });
});
const output: HTMLElement = $e(container, "div", (div: HTMLElement): void => {
    div.classList.add("error");
});
const canvas: HTMLCanvasElement = $e(container, "canvas", (elem: HTMLCanvasElement): void => {
    elem.width = SIZE;
    elem.height = SIZE;
})
const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;


function gcd(a: number, b: number): number {
    let c: number;
    while (a > 0) {
        c = a;
        a = b % a;
        b = c;
    }
    return b;
}


function circle(x: number, y: number, r: number, color: string): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}


function ldx(len: number, dir: number): number { return len * Math.sin(dir); }
function ldy(len: number, dir: number): number { return -len * Math.cos(dir); }


function gear(
    x: number,
    y: number,
    rMin: number,
    rMax: number,
    toothSize: number,
    color: string
): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    const circumference: number = 2 * rMax * Math.PI;
    const tipCount: number = Math.round(circumference / toothSize) * 4;
    const step: number = Math.PI * 2 / tipCount;
    for (let i: number = 0; i < tipCount; ++i) {
        const r: number = i % 4 < 2 ? rMax : rMin;
        const angle: number = step * i;
        ctx.lineTo(x + ldx(r, angle), y + ldy(r, angle));
    }
    ctx.closePath();
    ctx.fill();
}


function render(): void {
    ctx.clearRect(0, 0, SIZE, SIZE);
    const cr: number = OUTER_RADIUS - GEAR_RADIUS;
    if (SHOW_GEAR) {
        if (SHOW_BG) {
            gear(CENTER, CENTER, OUTER_RADIUS, OUTER_RADIUS - 8, 12, BG_COLOR);
        }
        gear(CENTER, CENTER - cr, GEAR_RADIUS, GEAR_RADIUS - 8, 12, "#333");
        circle(CENTER, CENTER - cr, 4, "#777");
        ctx.strokeStyle = "#777";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(CENTER, CENTER - cr);
        ctx.lineTo(CENTER, CENTER - cr - HOLE_DISTANCE);
        ctx.stroke();
        circle(CENTER, CENTER - cr - HOLE_DISTANCE, 4, COLOR);
    } else if (SHOW_BG) {
        circle(CENTER, CENTER, OUTER_RADIUS, BG_COLOR);
    }
    const rate: number = -GEAR_RADIUS / OUTER_RADIUS;
    const iterations: number = OUTER_RADIUS / gcd(OUTER_RADIUS, GEAR_RADIUS);
    const step: number = Math.PI / 180;
    const maxAngle: number = step * 360 * iterations;
    ctx.strokeStyle = COLOR;
    ctx.lineWidth = LINE_WIDTH;
    ctx.beginPath();
    ctx.moveTo(CENTER, CENTER - cr - HOLE_DISTANCE);
    for (let angle: number = step; angle < maxAngle; angle += step) {
        ctx.lineTo(
            CENTER + ldx(cr, angle) + ldx(HOLE_DISTANCE, rate * angle),
            CENTER + ldy(cr, angle) + ldy(HOLE_DISTANCE, rate * angle)
        );
    }
    ctx.closePath();
    ctx.stroke();
}


function update(): void {
    if (OUTER_RADIUS <= 0) {
        output.innerText = "Outer radius must be positive";
    } else if (GEAR_RADIUS <= 0) {
        output.innerText = "Gear radius must be positive";
    } else if (LINE_WIDTH <= 0) {
        output.innerText = "Line width must be positive";
    } else if (HOLE_DISTANCE < 0) {
        output.innerText = "Hole distance can't be negative";
    } else if (LINE_WIDTH > 10) {
        output.innerText = "Line width can't be greater than 10";
    } else if (HOLE_DISTANCE > GEAR_RADIUS + GEAR_RADIUS) {
        output.innerText = "Hole distance can't be greater than double the gear radius";
    } else if (OUTER_RADIUS > 400) {
        output.innerText = "Outer radius can't be greater than 400";
    } else if (GEAR_RADIUS >= OUTER_RADIUS) {
        output.innerText = "Gear radius can't be larger than area radius";
    } else {
        CENTER = OUTER_RADIUS + Math.max(0, HOLE_DISTANCE - GEAR_RADIUS + Math.ceil(LINE_WIDTH / 2));
        SIZE = CENTER + CENTER;
        canvas.width = SIZE;
        canvas.height = SIZE;
        output.innerText = "";
        render();
    }
}

update();



