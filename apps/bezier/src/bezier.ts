class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    clamp(min: number, max: number): Point {
        if (this.x < min) {
            this.x = min;
        } else if (this.x > max) {
            this.x = max;
        }
        if (this.y < min) {
            this.y = min;
        } else if (this.y > max) {
            this.y = max;
        }
        return this;
    }
}


let ptR: Point = new Point(0.01, 0.99);
let ptG: Point = new Point(0.99, 0.01);
let drawR: boolean = true;
let drawG: boolean = true;
let drawY: boolean = true;
let drawNet: boolean = true;
let steps: number = 50;
let moving: number = 0;
let ctx: CanvasRenderingContext2D;
let cnvs: HTMLCanvasElement;
let showR: HTMLInputElement;
let showG: HTMLInputElement;
let showY: HTMLInputElement;
let showNet: HTMLInputElement;
let netDensityBox: HTMLElement;
let netDensity: HTMLInputElement;
let rPointX: HTMLInputElement;
let rPointY: HTMLInputElement;
let gPointX: HTMLInputElement;
let gPointY: HTMLInputElement;


function quadraticBezier(x: number, a: number, b: number): number {
    x = Math.max(0, Math.min(1, x));
    a = Math.max(0, Math.min(1, a));
    b = Math.max(0, Math.min(1, b));
    if (a == 0.5) {
        a = 0.50001;
    }
    let om2a: number = 1 - 2 * a;
    let t: number = (Math.sqrt(a * a + om2a * x) - a) / om2a;
    return (t + 2 * b * (1 - t)) * t;
}


function slopeFromT(t: number, A: number, B: number, C: number): number {
    return 1.0 / (3.0 * A * t * t + 2.0 * B * t + C);
}


function xFromT(t: number, A: number, B: number, C: number): number {
    return (A * t * t + B * t + C) * t;
}


function yFromT(t: number, E: number, F: number, G: number): number {
    return (E * t * t + F * t + G) * t;
}


function cubicBezier(x: number, x1: number, y1: number, x2: number, y2: number): number {
    let A: number = 1 - 3 * x2 + 3 * x1;
    let B: number = 3 * x2 - 6 * x1;
    let C: number = 3 * x1;
    let E: number = 1 - 3 * y2 + 3 * y1;
    let F: number = 3 * y2 - 6 * y1;
    let G: number = 3 * y1;
    let currentT: number = x;
    let nRefinementIterations: number = 5;
    for (let i: number = 0; i < nRefinementIterations; i++) {
        let currentx: number = xFromT(currentT, A, B, C);
        let currentslope: number = slopeFromT(currentT, A, B, C);
        currentT -= (currentx - x) * currentslope;
        currentT = Math.max(0, Math.min(1, currentT));
    }
    return yFromT(currentT, E, F, G);
}

function getMousePos(e: MouseEvent): Point {
    let x, y;
    if (e.pageX || e.pageY) {
        x = e.pageX;
        y = e.pageY;
    } else {
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    x -= cnvs.offsetLeft;
    y -= cnvs.offsetTop;
    return new Point(x / 799, (799 - y) / 799);
}

function dist(pt1: Point, pt2: Point): number {
    let dx: number = pt2.x - pt1.x, dy: number = pt2.y - pt1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function drawRed(): void {
    if (!drawR) {
        return;
    }
    if (drawNet) {
        let d: Array<number> = [ptR.x * 799, ptR.y * 799, (1 - ptR.x) * 799, ptR.y * 799 - 799];
        for (let i: number = 0; i <= steps; ++i) {
            let coef: number = i / steps;
            ctx.beginPath();
            ctx.moveTo(d[0] * coef, 799 - d[1] * coef);
            ctx.lineTo(d[0] + d[2] * coef, 799 - d[1] + d[3] * coef);
            ctx.strokeStyle = "#FF000080";
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
    ctx.beginPath();
    ctx.moveTo(0, 799);
    for (let i: number = 1; i < 800; ++i) {
        let y: number = quadraticBezier(i / 799, ptR.x, ptR.y);
        ctx.lineTo(i, 799 - y * 799);
    }
    ctx.strokeStyle = drawNet ? "#FF8080" : "#FF0000";
    ctx.lineWidth = 3;
    ctx.stroke();
}

function drawGreen(): void {
    if (!drawG) {
        return;
    }
    if (drawNet) {
        let d: Array<number> = [ptG.x * 799, ptG.y * 799, (1 - ptG.x) * 799, ptG.y * 799 - 799];
        for (let i: number = 0; i <= steps; ++i) {
            let coef: number = i / steps;
            ctx.beginPath();
            ctx.moveTo(d[0] * coef, 799 - d[1] * coef);
            ctx.lineTo(d[0] + d[2] * coef, 799 - d[1] + d[3] * coef);
            ctx.strokeStyle = "#00FF0080";
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
    ctx.beginPath();
    ctx.moveTo(0, 799);
    for (let i: number = 1; i < 800; ++i) {
        let y: number = quadraticBezier(i / 799, ptG.x, ptG.y);
        ctx.lineTo(i, 799 - y * 799);
    }
    ctx.strokeStyle = drawNet ? "#80FF80" : "#00FF00";
    ctx.lineWidth = 3;
    ctx.stroke();
}

function drawYellowNet(): void {
    let d: Array<number> = [
        ptR.x * 799, ptR.y * 799,
        (ptG.x - ptR.x) * 799, (ptG.y - ptR.y) * 799,
        ptG.x * 799, ptG.y * 799,
        (1 - ptG.x) * 799, 799 - ptG.y * 799
    ];
    for (let i: number = 0; i <= steps; i += 1) {
        let coef: number = i / steps;
        let d2: Array<number> = [
            d[0] * coef, d[1] * coef,
            d[0] + d[2] * coef, d[1] + d[3] * coef,
            d[4] + d[6] * coef, d[5] + d[7] * coef
        ];
        let d3: Array<number> = [
            d2[2] - d2[0], d2[3] - d2[1],
            d2[4] - d2[2], d2[5] - d2[3],
            799 - d2[4], 799 - d2[5]
        ];
        ctx.beginPath();
        ctx.moveTo(d2[0], 799 - d2[1]);
        ctx.lineTo(d2[2], 799 - d2[3]);
        ctx.strokeStyle = "#FFFF0020";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(d2[2], 799 - d2[3]);
        ctx.lineTo(d2[4], 799 - d2[5]);
        ctx.strokeStyle = "#FFFF0020";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(d2[0] * coef, 799 - d2[1] * coef);
        ctx.lineTo(d2[0] + d3[0] * coef, 799 - d2[1] - d3[1] * coef);
        ctx.lineTo(d2[2] + d3[2] * coef, 799 - d2[3] - d3[3] * coef);
        ctx.lineTo(d2[4] + d3[4] * coef, 799 - d2[5] - d3[5] * coef);
        ctx.strokeStyle = "#FFFF0040";
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

function drawYellow(): void {
    if (!drawY) {
        return;
    }
    if (drawNet) {
        drawYellowNet();
    }
    ctx.beginPath();
    ctx.moveTo(0, 799);
    for (let i: number = 1; i < 800; ++i) {
        let y: number = cubicBezier(i / 799, ptR.x, ptR.y, ptG.x, ptG.y);
        ctx.lineTo(i, 799 - y * 799);
    }
    ctx.strokeStyle = drawNet ? "#FFFF80" : "#FFFF00";
    ctx.lineWidth = 3;
    ctx.stroke();
}

function draw(): void {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 800, 800);
    if (Math.abs(ptR.x - ptR.y) < Math.abs(ptG.x - ptG.y)) {
        drawGreen();
        drawRed();
    } else {
        drawRed();
        drawGreen();
    }
    drawYellow();

    ctx.beginPath();
    ctx.arc(799 * ptR.x, 799 - ptR.y * 799, 10, 0, 2 * Math.PI);
    let gradA: CanvasGradient = ctx.createRadialGradient(
        799 * ptR.x, 799 - ptR.y * 799, 3,
        799 * ptR.x, 799 - ptR.y * 799, 16
    );
    gradA.addColorStop(0, '#FF8080');
    gradA.addColorStop(0.25, '#C02020');
    gradA.addColorStop(1, '#800000');
    ctx.fillStyle = gradA;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(799 * ptG.x, 799 - ptG.y * 799, 10, 0, 2 * Math.PI);
    let gradB: CanvasGradient = ctx.createRadialGradient(
        799 * ptG.x, 799 - ptG.y * 799, 3,
        799 * ptG.x, 799 - ptG.y * 799, 16
    );
    gradB.addColorStop(0, '#80FF80');
    gradB.addColorStop(0.25, '#20C020');
    gradB.addColorStop(1, '#008000');
    ctx.fillStyle = gradB;
    ctx.fill();
}


export function initializeUI(container: HTMLElement): void {
    cnvs = <HTMLCanvasElement>container.querySelector("#ma-bezier-canvas");
    ctx = cnvs.getContext("2d")!;
    showR = <HTMLInputElement>container.querySelector("#ma-bezier-show-r");
    showG = <HTMLInputElement>container.querySelector("#ma-bezier-show-g");
    showY = <HTMLInputElement>container.querySelector("#ma-bezier-show-y");
    showNet = <HTMLInputElement>container.querySelector("#ma-bezier-show-net");
    netDensityBox = <HTMLElement>container.querySelector("#ma-bezier-net-density-box");
    netDensity = <HTMLInputElement>container.querySelector("#ma-bezier-net-density");
    rPointX = <HTMLInputElement>container.querySelector("#ma-bezier-rx");
    rPointY = <HTMLInputElement>container.querySelector("#ma-bezier-ry");
    gPointX = <HTMLInputElement>container.querySelector("#ma-bezier-gx");
    gPointY = <HTMLInputElement>container.querySelector("#ma-bezier-gy");
    showR.addEventListener("change", (): void => {
        drawR = showR.checked;
        draw();
    });
    showG.addEventListener("change", (): void => {
        drawG = showG.checked;
        draw();
    });
    showY.addEventListener("change", (): void => {
        drawY = showY.checked;
        draw();
    });
    showNet.addEventListener("change", (): void => {
        drawNet = showNet.checked;
        netDensityBox.style.display = drawNet ? "inline-block" : "none";
        draw();
    });
    netDensity.addEventListener("change", (): void => {
        let value: number = parseInt(<string>netDensity.value);
        if (!isFinite(value)) {
            return;
        }
        steps = value < 1 ? 1 : value > 1000 ? 1000 : value;
        draw();
    });
    rPointX.addEventListener("change", (): void => {
        let value: number = parseFloat(<string>rPointX.value) / 100;
        if (!isFinite(value)) {
            return;
        }
        ptR.x = value < 0 ? 0 : value > 1 ? 1 : value;
        draw();
    });
    rPointY.addEventListener("change", (): void => {
        let value: number = parseFloat(<string>rPointY.value) / 100;
        if (!isFinite(value)) {
            return;
        }
        ptR.y = value < 0 ? 0 : value > 1 ? 1 : value;
        draw();
    });
    gPointX.addEventListener("change", (): void => {
        let value: number = parseFloat(<string>gPointX.value) / 100;
        if (!isFinite(value)) {
            return;
        }
        ptG.x = value < 0 ? 0 : value > 1 ? 1 : value;
        draw();
    });
    gPointY.addEventListener("change", (): void => {
        let value: number = parseFloat(<string>gPointY.value) / 100;
        if (!isFinite(value)) {
            return;
        }
        ptG.y = value < 0 ? 0 : value > 1 ? 1 : value;
        draw();
    });
    cnvs.addEventListener("mousedown", (e: MouseEvent): void => {
        let pt: Point = getMousePos(e);
        if (dist(pt, ptR) <= 1 / 80) {
            ptR = pt.clamp(0, 1);
            rPointX.value = String(ptR.x * 100);
            rPointY.value = String(ptR.y * 100);
            moving = 1;
        } else if (dist(pt, ptG) <= 1 / 80) {
            ptG = pt.clamp(0, 1);
            gPointX.value = String(ptG.x * 100);
            gPointY.value = String(ptG.y * 100);
            moving = 2;
        }
    });
    cnvs.addEventListener("mouseup", (): void => { moving = 0; });
    cnvs.addEventListener("mouseout", (): void => { moving = 0; });
    cnvs.addEventListener("mousemove", (e: MouseEvent): void => {
        if (moving == 0) {
            return;
        } else if (moving == 1) {
            ptR = getMousePos(e).clamp(0, 1);
            rPointX.value = String(ptR.x * 100);
            rPointY.value = String(ptR.y * 100);
        } else {
            ptG = getMousePos(e).clamp(0, 1);
            gPointX.value = String(ptG.x * 100);
            gPointY.value = String(ptG.y * 100);
        }
        draw();
    });
    draw();
}
