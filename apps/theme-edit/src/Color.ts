import { DEBUG } from '@/config';

export default class Color {
    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly hex: string;

    constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        const hex: Array<string> = ['#'];
        Color.toHex(this.r, hex);
        Color.toHex(this.g, hex);
        Color.toHex(this.b, hex);
        this.hex = hex.join('');
    }

    toHue(input: HTMLInputElement): Color {
        let hue;
        try {
            hue = parseInt(input.value.trim());
        } catch (error) {
            input.setCustomValidity('Invalid hue');
            throw error;
        }
        if (hue < 0) {
            input.setCustomValidity('Invalid hue');
            throw new Error('Invalid hue');
        }
        hue %= 360;
        input.setCustomValidity('');
        const cmax: number = Math.max(this.r, this.g, this.b);
        const cmin: number = Math.min(this.r, this.g, this.b);
        const delta: number = cmax - cmin;
        const c: number = delta / 255;
        const x: number = c - c * Math.abs(hue / 60 % 2 - 1);
        const m: number = (cmin + cmax) / 510 - c * 0.5;
        if (hue < 60) {
            return new Color(Color.fcomp(c + m), Color.fcomp(x + m), Color.fcomp(m));
        } else if (hue < 120) {
            return new Color(Color.fcomp(x + m), Color.fcomp(c + m), Color.fcomp(m));
        } else if (hue < 180) {
            return new Color(Color.fcomp(m), Color.fcomp(c + m), Color.fcomp(x + m));
        } else if (hue < 240) {
            return new Color(Color.fcomp(m), Color.fcomp(x + m), Color.fcomp(c + m));
        } else if (hue < 300) {
            return new Color(Color.fcomp(x + m), Color.fcomp(m), Color.fcomp(c + m));
        } else {
            return new Color(Color.fcomp(c + m), Color.fcomp(m), Color.fcomp(x + m));
        }
    }

    /** Swap light/dark while keeping hue */
    hueSafeInvert(): Color {
        const shift: number = (
            255 - Math.max(this.r, this.g, this.b) - Math.min(this.r, this.g, this.b)
        );
        return new Color(this.r + shift, this.g + shift, this.b + shift);
    }

    lerp(target: Color, ammount: number): Color {
        return new Color(
            Color.comp(this.r + (target.r - this.r) * ammount),
            Color.comp(this.g + (target.g - this.g) * ammount),
            Color.comp(this.b + (target.b - this.b) * ammount)
        );
    }

    private static toHex(x: number, strs: Array<string>): void {
        if (x < 16) {
            strs.push('0');
        }
        strs.push(x.toString(16));
    }

    private static comp(x: number): number {
        return x <= 0 ? 0 : x >= 255 ? 255 : Math.round(x);
    }

    private static fcomp(x: number): number {
        return x <= 0 ? 0 : x >= 1 ? 255 : Math.round(x * 255);
    }

    private static HEX_SHORT_REGEX: RegExp = /^\s*#([0-9a-f])([0-9a-f])([0-9a-f])\s*$/i;

    private static HEX_LONG_REGEX: RegExp = /^\s*#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})\s*$/i;

    private static RGB_REGEX: RegExp = (
        /^\s*rgb\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)\s*$/i
    );

    static parse(input: HTMLInputElement): Color {
        const str: string = input.value;
        let match, color;
        if ((match = Color.HEX_SHORT_REGEX.exec(str)) != null) {
            color = new Color(
                parseInt(match[1], 16) * 17,
                parseInt(match[2], 16) * 17,
                parseInt(match[3], 16) * 17
            );
        } else if ((match = Color.HEX_LONG_REGEX.exec(str)) != null) {
            color = new Color(
                parseInt(match[1], 16),
                parseInt(match[2], 16),
                parseInt(match[3], 16)
            );
        } else if ((match = Color.RGB_REGEX.exec(str)) != null) {
            color = new Color(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
        } else {
            input.setCustomValidity('Invalid color');
            throw new Error('Invalid color');
        }
        if (DEBUG) {
            console.log(input.id, match, color);
        }
        input.setCustomValidity('');
        return color;
    }
}
