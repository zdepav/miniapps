import { PickerBlock } from '@/ColorPicker';
import { Optional, Tuple3, $svg, $svgPath, clamp, noDrag, wrap1 } from '@/utils';
import RGBColor from '@/RGBColor';

type OnChange = (color: RGBColor) => void;

const TRIANGLE_SIDE: number = 10.4;
const TRIANGLE_WIDTH: number = TRIANGLE_SIDE * 2;
const TRIANGLE_HEIGHT: number = 18;
const SIDE_HEIGHT_HYPOTENUSE: number = (
    TRIANGLE_HEIGHT * TRIANGLE_HEIGHT + TRIANGLE_SIDE * TRIANGLE_SIDE
);
const TRIANGLE: string = (
    `M15,3l${TRIANGLE_SIDE},${TRIANGLE_HEIGHT}h${-TRIANGLE_WIDTH}z`
);
const WHEEL_INNER_SQUARED_RADIUS: number = 144;
const WHEEL_OUTER_SQUARED_RADIUS: number = 225;


function $svgStop(offset: string, color: string, opacity?: string): SVGElement {
    const stop: SVGElement = $svg('stop');
    stop.setAttribute('offset', offset);
    stop.setAttribute('stop-color', color);
    if (opacity != null) {
        stop.setAttribute('stop-opacity', opacity);
    }
    return stop;
}


function $svgGradient(id: string, x1: string, y1: string, x2: string, y2: string): SVGElement {
    const gradient: SVGElement = $svg('linearGradient');
    gradient.id = id;
    gradient.setAttribute('x1', x1);
    gradient.setAttribute('y1', y1);
    gradient.setAttribute('x2', x2);
    gradient.setAttribute('y2', y2);
    gradient.setAttribute('gradientUnits', 'objectBoundingBox');
    return gradient;
}


export default class HSVWheel extends PickerBlock {
    private readonly svgElement: SVGElement;
    private readonly colorGradStops: Array<SVGElement>;
    private readonly rotatingGroup: SVGElement;
    private readonly cursorGroup: SVGElement;
    private readonly cursor: SVGElement;
    private hue: number; // 0..1
    private saturation: number; // 0..1
    private value: number; // 0..1
    private dragging: Optional<boolean>; // null: not dragging, true: triangle, false: wheel

    onChange: Optional<OnChange>;

    constructor() {
        super(document.createElement('div'), 5, 5);
        this.element.classList.add('hsv-wheel');
        this.onChange = null;
        this.dragging = null;
        const id: string = Math.floor(Math.random() * 90000 + 10000).toString();
        this.colorGradStops = [$svgStop('0%', '#f00'), $svgStop('100%', '#f00', '0')];
        this.element.appendChild(document.createElement('div'));
        this.cursor = $svgPath('M15,2.5a.5,.5,0,0,0,0,1a.5,.5,0,0,0,0-1z');
        this.cursor.setAttribute('fill', '#f00');
        this.hue = 0;
        this.svgElement = $svg('svg');
        noDrag(this.svgElement);
        this.svgElement.setAttribute('viewBox', '0 0 30 30');
        this.svgElement.appendChild(this.buildSvgDefs(id));
        this.cursorGroup = this.buildCursorGroup();
        this.rotatingGroup = this.buildRotatingGroup(id);
        this.svgElement.appendChild(this.rotatingGroup);
        this.svgElement.addEventListener('mousedown', (event: MouseEvent): void => {
            if (event.button == 0) {
                this.dragging = this.updateByMouse(event.offsetX, event.offsetY);
            }
        });
        this.svgElement.addEventListener('mousemove', (event: MouseEvent): void => {
            if (this.dragging != null) {
                this.updateByMouse(event.offsetX, event.offsetY, this.dragging);
            }
        });
        this.svgElement.addEventListener('mouseup', (event: MouseEvent): void => {
            if (event.button == 0) {
                this.dragging = null;
            }
        });
        this.svgElement.addEventListener('mouseenter', (): void => {
            this.dragging = null;
        });
        this.svgElement.addEventListener('mouseleave', (): void => {
            this.dragging = null;
        });
        this.element.appendChild(this.svgElement);
        this.saturation = 0;
        this.value = 0;
    }

    private buildSvgDefs(id: string): SVGElement {
        const defs: SVGElement = $svg('defs');
        let gradient: SVGElement = $svgGradient(`g-bw-${id}`, '0', '0', '1', '0');
        gradient.appendChild($svgStop('0%', '#000'));
        gradient.appendChild($svgStop('100%', '#fff'));
        defs.appendChild(gradient);
        gradient = $svgGradient(`g-col-${id}`, '0', '0', '0', '1');
        for (const stop of this.colorGradStops) {
            gradient.appendChild(stop);
        }
        defs.appendChild(gradient);
        const clipPath: SVGElement = $svg('clipPath');
        clipPath.id = `clip-${id}`;
        clipPath.appendChild($svgPath('M15,3a12,12,0,0,1,0,24a12,12,0,0,1,0-24z'));
        defs.appendChild(clipPath);
        return defs;
    }

    private buildRotatingGroup(id: string): SVGElement {
        const g: SVGElement = $svg('g');
        g.setAttribute('transform-origin', '15 15');
        let path: SVGElement = $svgPath('M14.625,.25h.75v2.5h-.75z');
        path.classList.add('dark');
        g.appendChild(path);
        path = $svgPath('M14.875,0h.25v3h-.25z');
        path.classList.add('light');
        g.appendChild(path);
        path = $svgPath(TRIANGLE);
        path.classList.add('stroke-light');
        path.setAttribute('stroke-width', '0.25');
        path.setAttribute('clip-path', `url(#clip-${id})`);
        g.appendChild(path);
        path = $svgPath(TRIANGLE);
        path.setAttribute('fill', `url(#g-bw-${id})`);
        g.appendChild(path);
        path = $svgPath(TRIANGLE);
        path.setAttribute('fill', `url(#g-col-${id})`);
        g.appendChild(path);
        g.append(this.cursorGroup);
        return g;
    }

    private buildCursorGroup(): SVGElement {
        const g: SVGElement = $svg('g');
        let path: SVGElement = $svgPath('M15,2a1,1,0,0,1,0,2a1,1,0,0,1,0-2z');
        path.classList.add('dark');
        g.appendChild(path);
        path = $svgPath('M15,2.25a.75,.75,0,0,1,0,1.5a.75,.75,0,0,1,0-1.5z');
        path.classList.add('light');
        g.appendChild(path);
        g.appendChild(this.cursor);
        return g;
    }

    setColor(color: RGBColor): void {
        const hsv: Tuple3<number> = color.toHSV();
        this.hue = wrap1(hsv[0]);
        this.saturation = hsv[1];
        this.value = hsv[2];
        this.updateHue();
        this.updateSV();
        this.cursor.setAttribute('fill', color.toHex());
    }

    private updateHue(): void {
        const deg: number = this.hue * 360;
        this.rotatingGroup.setAttribute('transform', `rotate(${deg})`);
        for (const stop of this.colorGradStops) {
            stop.setAttribute('stop-color', `hsl(${deg}, 100%, 50%)`);
        }
    }

    private updateSV(): void {
        const isv: number = 1 - this.saturation * this.value;
        const x: number = TRIANGLE_SIDE * (2 * this.value - 2 + isv);
        this.cursorGroup.setAttribute('transform', `translate(${x}, ${TRIANGLE_HEIGHT * isv})`);
    }

    private updateByMouse(x: number, y: number, inTriangle?: boolean): Optional<boolean> {
        // transform to SVG's coordinate system with origin at wheel's center
        const svgSize: number = this.svgElement.getBoundingClientRect().width;
        const outerHalfSize: number = svgSize * 0.5;
        const innerSizeScale: number = 30 / svgSize;
        x = (x - outerHalfSize) * innerSizeScale;
        y = (y - outerHalfSize) * innerSizeScale;

        // detect changed property if mouse down
        if (inTriangle == null) {
            const distanceSquared: number = x * x + y * y;
            if (distanceSquared > WHEEL_OUTER_SQUARED_RADIUS) {
                return null;
            }
            inTriangle = distanceSquared < WHEEL_INNER_SQUARED_RADIUS;
        }

        if (inTriangle) {
            this.triangleCoordsToSV(x, y);
            this.updateSV();
        } else if (x == 0 && y == 0) {
            return false;
        } else {
            this.hue = (Math.atan2(y, x) / Math.PI * 0.5 + 0.25) % 1;
            this.updateHue();
        }
        const color: RGBColor = RGBColor.fromHSV(this.hue, this.saturation, this.value);
        if (this.onChange != null) {
            this.onChange(color);
        }
        this.cursor.setAttribute('fill', color.toHex());
        return inTriangle;
    }

    private triangleCoordsToSV(ox: number, oy: number): void {
        // inverse hue rotation and move origin to triangle's top vertex
        const angle: number = -2 * this.hue * Math.PI;
        const sin: number = Math.sin(angle);
        const cos: number = Math.cos(angle);
        let x: number = ox * cos - oy * sin;
        let y: number = ox * sin + oy * cos + 12;

        // map positions outside triangle to its edges
        let ax: number = Math.abs(x);
        if (y >= TRIANGLE_HEIGHT) {
            // bellow triangle -> map to it's bottom edge
            this.value = clamp((x + TRIANGLE_SIDE) / TRIANGLE_WIDTH);
            this.saturation = 0;
        } else if (y < 0 && ax * TRIANGLE_SIDE <= -y * TRIANGLE_HEIGHT) {
            // mapping to top vertex
            this.value = 1;
            this.saturation = 1;
        } else if (y >= 0 && ax * TRIANGLE_HEIGHT <= y * TRIANGLE_SIDE) {
            // inside triangle
            this.value = x / TRIANGLE_WIDTH - y * 0.5 / TRIANGLE_HEIGHT + 1;
            this.saturation = this.value == 0 ? 0 : (1 - y / TRIANGLE_HEIGHT) / this.value;
        } else if (ax - TRIANGLE_SIDE >= (TRIANGLE_HEIGHT - y) / TRIANGLE_SIDE * TRIANGLE_HEIGHT) {
            // mapping to one of botom vertices
            this.value = x > 0 ? 1 : 0;
            this.saturation = 0;
        } else {
            // mapping to left or right edge
            const n: number = (
                ax - TRIANGLE_HEIGHT * (
                    (TRIANGLE_HEIGHT * ax - TRIANGLE_SIDE * y) / SIDE_HEIGHT_HYPOTENUSE
                )
            ) / TRIANGLE_SIDE;
            if (x > 0) {
                this.value = 1;
                this.saturation = clamp(1 - n);
            } else {
                this.value = clamp(1 - n);
                this.saturation = 1;
            }
        }
    }
}
