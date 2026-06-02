import {
    Optional, Tuple3, Tuple4,
    byte2hex, clamp, f2Hex, halfByte2hex, readHex, wrap1
} from '@/utils';

const HEX_COLOR_REGEX: RegExp = /^(?:#|0x)?[0-9a-fA-F]{3,8}$/;

export default class RGBColor {
    readonly r: number;
    readonly g: number;
    readonly b: number;
    private hex: Optional<string>;

    constructor(red?: number, green?: number, blue?: number) {
        this.r = clamp(red ?? 0);
        this.g = clamp(green ?? 0);
        this.b = clamp(blue ?? 0);
        this.hex = null;
    }

    serialize(): string {
        return JSON.stringify([this.r, this.g, this.b]);
    }

    mix(color2: RGBColor, amount: number): RGBColor {
        return new RGBColor(
            this.r + (color2.r - this.r) * amount,
            this.g + (color2.g - this.g) * amount,
            this.b + (color2.b - this.b) * amount
        );
    }

    // ====================================================================================== //
    //                               Conversions: RGBColor -> ?                               //
    // ====================================================================================== //

    private getHue(chroma: number, max: number): number {
        if (chroma == 0) {
            return 0;
        } else if (max == this.r) {
            return ((this.g - this.b) / chroma + 6) % 6 / 6;
        } else if (max == this.g) {
            return ((this.b - this.r) / chroma + 2) / 6;
        } else {
            return ((this.r - this.g) / chroma + 4) / 6;
        }
    }

    toHSL(): Tuple3<number> {
        const max: number = Math.max(this.r, this.g, this.b);
        const min: number = Math.min(this.r, this.g, this.b);
        return [
            this.getHue(max - min, max),
            max <= 0 || min >= 1 ? 0 : (max - min) / (1 - Math.abs(max + min - 1)),
            (max + min) * 0.5
        ];
    }

    toHSV(): Tuple3<number> {
        const max: number = Math.max(this.r, this.g, this.b);
        const min: number = Math.min(this.r, this.g, this.b);
        return [this.getHue(max - min, max), max == 0 ? 0 : (max - min) / max, max];
    }

    toCMYK(): Tuple4<number> {
        const invbl: number = Math.max(this.r, this.g, this.b);
        return invbl <= 0 ? [0, 0, 0, 1] : [
            (invbl - this.r) / invbl, (invbl - this.g) / invbl, (invbl - this.b) / invbl, 1 - invbl
        ];
    }

    toInt32RGB(): number {
        return (
            (Math.round(this.r * 255) << 16) |
            (Math.round(this.g * 255) << 8) |
            Math.round(this.b * 255)
        );
    }

    toHex(): string {
        if (this.hex == null) {
            this.hex = `#${f2Hex(this.r)}${f2Hex(this.g)}${f2Hex(this.b)}`;
        }
        return this.hex;
    }

    // ====================================================================================== //
    //                               Conversions: ? -> RGBColor                               //
    // ====================================================================================== //

    static fromInt8RGB(red: number, green: number, blue: number): RGBColor {
        return new RGBColor(red / 255, green / 255, blue / 255);
    }

    static fromInt32RGB(rgb: number): RGBColor {
        return new RGBColor(((rgb >> 16) & 255) / 255, ((rgb >> 8) & 255) / 255, (rgb & 255) / 255);
    }

    static fromHSL(hue: number, saturation: number, lightness: number): RGBColor {
        const chroma: number = saturation - saturation * Math.abs(2 * lightness - 1);
        hue = wrap1(hue) * 6;
        const x: number = chroma - chroma * Math.abs(hue % 2 - 1);
        const r: number = hue < 1 || hue >= 5 ? chroma : hue < 2 || hue >= 4 ? x : 0;
        const g: number = hue >= 1 && hue < 3 ? chroma : hue < 4 ? x : 0;
        const b: number = hue >= 3 && hue < 5 ? chroma : hue >= 2 ? x : 0;
        const m: number = lightness - chroma * 0.5;
        return new RGBColor(r + m, g + m, b + m);
    }

    static fromHSV(hue: number, saturation: number, value: number): RGBColor {
        const chroma: number = saturation * value;
        hue = wrap1(hue) * 6;
        const x: number = value - chroma * Math.abs(hue % 2 - 1);
        if (hue < 1) {
            return new RGBColor(value, x, value - chroma);
        } else if (hue < 2) {
            return new RGBColor(x, value, value - chroma);
        } else if (hue < 3) {
            return new RGBColor(value - chroma, value, x);
        } else if (hue < 4) {
            return new RGBColor(value - chroma, x, value);
        } else if (hue < 5) {
            return new RGBColor(x, value - chroma, value);
        } else {
            return new RGBColor(value, value - chroma, x);
        }
    }

    static fromCMYK(cyan: number, magenta: number, yellow: number, black: number): RGBColor {
        const invbl: number = 1 - black;
        return new RGBColor((1 - cyan) * invbl, (1 - magenta) * invbl, (1 - yellow) * invbl);
    }

    static fromHex(str: string): RGBColor {
        return RGBColor.fromInt32RGB(RGBColor.hexToInt32RGB(str) ?? 0);
    }

    // ====================================================================================== //
    //                            Other static methods and fields                             //
    // ====================================================================================== //

    static int32RGBToHex(rgb: number, allowShortForm: boolean = true): string {
        const r: number = (rgb >> 16) & 255;
        const g: number = (rgb >> 8) & 255;
        const b: number = rgb & 255;
        if (allowShortForm && r % 17 == 0 && g % 17 == 0 && b % 17 == 0) {
            return `#${halfByte2hex(r)}${halfByte2hex(g)}${halfByte2hex(b)}`;
        } else {
            return `#${byte2hex(r)}${byte2hex(g)}${byte2hex(b)}`;
        }
    }

    static hexToInt32RGB(str: string): Optional<number> {
        if (!HEX_COLOR_REGEX.test(str)) {
            return null;
        }
        let i: number = str.charCodeAt(0) == 35 ? 1 : str.charCodeAt(0) == 48 ? 2 : 0;
        if (str.length - i < 6) { // RGB, RGBA or RGBAA
            return (
                ((readHex(str, i) * 17) << 16) |
                ((readHex(str, i + 1) * 17) << 8) |
                (readHex(str, i + 2) * 17)
            );
        } else { // RRGGBB, RRGGBBA or RRGGBBAA
            return readHex(str, i, 6);
        }
    }

    static deserialize(json: string): Optional<RGBColor> {
        let rgb: any;
        try {
            rgb = JSON.parse(json);
        } catch {
            return null;
        }
        if (!Array.isArray(rgb) || rgb.length != 3) {
            return null;
        }
        for (let i: number = 0; i < 3; ++i) if (typeof rgb[i] != 'number' || Number.isNaN(rgb[i])) {
            return null;
        }
        return new RGBColor(rgb[0], rgb[1], rgb[2]);
    }
}


export const WebColors: Record<string, RGBColor> = {
    'Alice Blue': RGBColor.fromInt32RGB(0xf0f8ff),
    'Antique White': RGBColor.fromInt32RGB(0xfaebd7),
    Aqua: RGBColor.fromInt32RGB(0x00ffff),
    Aquamarine: RGBColor.fromInt32RGB(0x7fffd4),
    Azure: RGBColor.fromInt32RGB(0xf0ffff),
    Beige: RGBColor.fromInt32RGB(0xf5f5dc),
    Bisque: RGBColor.fromInt32RGB(0xffe4c4),
    Black: RGBColor.fromInt32RGB(0x000000),
    'Blanched Almond': RGBColor.fromInt32RGB(0xffebcd),
    Blue: RGBColor.fromInt32RGB(0x0000ff),
    'Blue Violet': RGBColor.fromInt32RGB(0x8a2be2),
    Brown: RGBColor.fromInt32RGB(0xa52a2a),
    'Burly Wood': RGBColor.fromInt32RGB(0xdeb887),
    'Cadet Blue': RGBColor.fromInt32RGB(0x5f9ea0),
    Chartreuse: RGBColor.fromInt32RGB(0x7fff00),
    Chocolate: RGBColor.fromInt32RGB(0xd2691e),
    Coral: RGBColor.fromInt32RGB(0xff7f50),
    'Cornflower Blue': RGBColor.fromInt32RGB(0x6495ed),
    Cornsilk: RGBColor.fromInt32RGB(0xfff8dc),
    Crimson: RGBColor.fromInt32RGB(0xdc143c),
    Cyan: RGBColor.fromInt32RGB(0x00ffff),
    'Dark Blue': RGBColor.fromInt32RGB(0x00008b),
    'Dark Cyan': RGBColor.fromInt32RGB(0x008b8b),
    'Dark Golden Rod': RGBColor.fromInt32RGB(0xb8860b),
    'Dark Gray': RGBColor.fromInt32RGB(0xa9a9a9),
    'Dark Grey': RGBColor.fromInt32RGB(0xa9a9a9),
    'Dark Green': RGBColor.fromInt32RGB(0x006400),
    'Dark Khaki': RGBColor.fromInt32RGB(0xbdb76b),
    'Dark Magenta': RGBColor.fromInt32RGB(0x8b008b),
    'Dark Olive Green': RGBColor.fromInt32RGB(0x556b2f),
    'Dark Orange': RGBColor.fromInt32RGB(0xff8c00),
    'Dark Orchid': RGBColor.fromInt32RGB(0x9932cc),
    'Dark Red': RGBColor.fromInt32RGB(0x8b0000),
    'Dark Salmon': RGBColor.fromInt32RGB(0xe9967a),
    'Dark Sea Green': RGBColor.fromInt32RGB(0x8fbc8f),
    'Dark Slate Blue': RGBColor.fromInt32RGB(0x483d8b),
    'Dark Slate Gray': RGBColor.fromInt32RGB(0x2f4f4f),
    'Dark Slate Grey': RGBColor.fromInt32RGB(0x2f4f4f),
    'Dark Turquoise': RGBColor.fromInt32RGB(0x00ced1),
    'Dark Violet': RGBColor.fromInt32RGB(0x9400d3),
    'Deep Pink': RGBColor.fromInt32RGB(0xff1493),
    'Deep Sky Blue': RGBColor.fromInt32RGB(0x00bfff),
    'Dim Gray': RGBColor.fromInt32RGB(0x696969),
    'Dim Grey': RGBColor.fromInt32RGB(0x696969),
    'Dodger Blue': RGBColor.fromInt32RGB(0x1e90ff),
    'Fire Brick': RGBColor.fromInt32RGB(0xb22222),
    'Floral White': RGBColor.fromInt32RGB(0xfffaf0),
    'Forest Green': RGBColor.fromInt32RGB(0x228b22),
    Fuchsia: RGBColor.fromInt32RGB(0xff00ff),
    Gainsboro: RGBColor.fromInt32RGB(0xdcdcdc),
    'Ghost White': RGBColor.fromInt32RGB(0xf8f8ff),
    Gold: RGBColor.fromInt32RGB(0xffd700),
    'Golden Rod': RGBColor.fromInt32RGB(0xdaa520),
    Gray: RGBColor.fromInt32RGB(0x808080),
    Grey: RGBColor.fromInt32RGB(0x808080),
    Green: RGBColor.fromInt32RGB(0x008000),
    'Green Yellow': RGBColor.fromInt32RGB(0xadff2f),
    'Honey Dew': RGBColor.fromInt32RGB(0xf0fff0),
    'Hot Pink': RGBColor.fromInt32RGB(0xff69b4),
    'Indian Red': RGBColor.fromInt32RGB(0xcd5c5c),
    Indigo: RGBColor.fromInt32RGB(0x4b0082),
    Ivory: RGBColor.fromInt32RGB(0xfffff0),
    Khaki: RGBColor.fromInt32RGB(0xf0e68c),
    Lavender: RGBColor.fromInt32RGB(0xe6e6fa),
    'Lavender Blush': RGBColor.fromInt32RGB(0xfff0f5),
    'Lawn Green': RGBColor.fromInt32RGB(0x7cfc00),
    'Lemon Chiffon': RGBColor.fromInt32RGB(0xfffacd),
    'Light Blue': RGBColor.fromInt32RGB(0xadd8e6),
    'Light Coral': RGBColor.fromInt32RGB(0xf08080),
    'Light Cyan': RGBColor.fromInt32RGB(0xe0ffff),
    'Light Golden Rod Yellow': RGBColor.fromInt32RGB(0xfafad2),
    'Light Gray': RGBColor.fromInt32RGB(0xd3d3d3),
    'Light Grey': RGBColor.fromInt32RGB(0xd3d3d3),
    'Light Green': RGBColor.fromInt32RGB(0x90ee90),
    'Light Pink': RGBColor.fromInt32RGB(0xffb6c1),
    'Light Salmon': RGBColor.fromInt32RGB(0xffa07a),
    'Light Sea Green': RGBColor.fromInt32RGB(0x20b2aa),
    'Light Sky Blue': RGBColor.fromInt32RGB(0x87cefa),
    'Light Slate Gray': RGBColor.fromInt32RGB(0x778899),
    'Light Slate Grey': RGBColor.fromInt32RGB(0x778899),
    'Light Steel Blue': RGBColor.fromInt32RGB(0xb0c4de),
    'Light Yellow': RGBColor.fromInt32RGB(0xffffe0),
    Lime: RGBColor.fromInt32RGB(0x00ff00),
    'Lime Green': RGBColor.fromInt32RGB(0x32cd32),
    Linen: RGBColor.fromInt32RGB(0xfaf0e6),
    Magenta: RGBColor.fromInt32RGB(0xff00ff),
    Maroon: RGBColor.fromInt32RGB(0x800000),
    'Medium Aqua Marine': RGBColor.fromInt32RGB(0x66cdaa),
    'Medium Blue': RGBColor.fromInt32RGB(0x0000cd),
    'Medium Orchid': RGBColor.fromInt32RGB(0xba55d3),
    'Medium Purple': RGBColor.fromInt32RGB(0x9370db),
    'Medium Sea Green': RGBColor.fromInt32RGB(0x3cb371),
    'Medium Slate Blue': RGBColor.fromInt32RGB(0x7b68ee),
    'Medium Spring Green': RGBColor.fromInt32RGB(0x00fa9a),
    'Medium Turquoise': RGBColor.fromInt32RGB(0x48d1cc),
    'Medium Violet Red': RGBColor.fromInt32RGB(0xc71585),
    'Midnight Blue': RGBColor.fromInt32RGB(0x191970),
    'Mint Cream': RGBColor.fromInt32RGB(0xf5fffa),
    'Misty Rose': RGBColor.fromInt32RGB(0xffe4e1),
    Moccasin: RGBColor.fromInt32RGB(0xffe4b5),
    'Navajo White': RGBColor.fromInt32RGB(0xffdead),
    Navy: RGBColor.fromInt32RGB(0x000080),
    'Old Lace': RGBColor.fromInt32RGB(0xfdf5e6),
    Olive: RGBColor.fromInt32RGB(0x808000),
    'Olive Drab': RGBColor.fromInt32RGB(0x6b8e23),
    Orange: RGBColor.fromInt32RGB(0xffa500),
    'Orange Red': RGBColor.fromInt32RGB(0xff4500),
    Orchid: RGBColor.fromInt32RGB(0xda70d6),
    'Pale Golden Rod': RGBColor.fromInt32RGB(0xeee8aa),
    'Pale Green': RGBColor.fromInt32RGB(0x98fb98),
    'Pale Turquoise': RGBColor.fromInt32RGB(0xafeeee),
    'Pale Violet Red': RGBColor.fromInt32RGB(0xdb7093),
    'Papaya Whip': RGBColor.fromInt32RGB(0xffefd5),
    'Peach Puff': RGBColor.fromInt32RGB(0xffdab9),
    Peru: RGBColor.fromInt32RGB(0xcd853f),
    Pink: RGBColor.fromInt32RGB(0xffc0cb),
    Plum: RGBColor.fromInt32RGB(0xdda0dd),
    'Powder Blue': RGBColor.fromInt32RGB(0xb0e0e6),
    Purple: RGBColor.fromInt32RGB(0x800080),
    'Rebecca Purple': RGBColor.fromInt32RGB(0x663399),
    Red: RGBColor.fromInt32RGB(0xff0000),
    'Rosy Brown': RGBColor.fromInt32RGB(0xbc8f8f),
    'Royal Blue': RGBColor.fromInt32RGB(0x4169e1),
    'Saddle Brown': RGBColor.fromInt32RGB(0x8b4513),
    Salmon: RGBColor.fromInt32RGB(0xfa8072),
    'Sandy Brown': RGBColor.fromInt32RGB(0xf4a460),
    'Sea Green': RGBColor.fromInt32RGB(0x2e8b57),
    'Sea Shell': RGBColor.fromInt32RGB(0xfff5ee),
    Sienna: RGBColor.fromInt32RGB(0xa0522d),
    Silver: RGBColor.fromInt32RGB(0xc0c0c0),
    'Sky Blue': RGBColor.fromInt32RGB(0x87ceeb),
    'Slate Blue': RGBColor.fromInt32RGB(0x6a5acd),
    'Slate Gray': RGBColor.fromInt32RGB(0x708090),
    'Slate Grey': RGBColor.fromInt32RGB(0x708090),
    Snow: RGBColor.fromInt32RGB(0xfffafa),
    'Spring Green': RGBColor.fromInt32RGB(0x00ff7f),
    'Steel Blue': RGBColor.fromInt32RGB(0x4682b4),
    Tan: RGBColor.fromInt32RGB(0xd2b48c),
    Teal: RGBColor.fromInt32RGB(0x008080),
    Thistle: RGBColor.fromInt32RGB(0xd8bfd8),
    Tomato: RGBColor.fromInt32RGB(0xff6347),
    Turquoise: RGBColor.fromInt32RGB(0x40e0d0),
    Violet: RGBColor.fromInt32RGB(0xee82ee),
    Wheat: RGBColor.fromInt32RGB(0xf5deb3),
    White: RGBColor.fromInt32RGB(0xffffff),
    'White Smoke': RGBColor.fromInt32RGB(0xf5f5f5),
    Yellow: RGBColor.fromInt32RGB(0xffff00),
    'Yellow Green': RGBColor.fromInt32RGB(0x9acd32)
};


export const WebColorSets: Record<string, Array<RGBColor>> = {
    Hue: [
        WebColors.Red, WebColors.Yellow, WebColors.Lime, WebColors.Cyan,
        WebColors.Blue, WebColors.Magenta, WebColors.Red
    ],
    HSLSaturation: [WebColors.Gray, WebColors.Red],
    HSVSaturation: [WebColors.White, WebColors.Red],
    Light: [WebColors.Black, WebColors.White],
    Red: [WebColors.Black, WebColors.Red],
    Green: [WebColors.Black, WebColors.Lime],
    Blue: [WebColors.Black, WebColors.Blue],
    CMYKCyan: [WebColors.White, WebColors.Cyan],
    CMYKMagenta: [WebColors.White, WebColors.Magenta],
    CMYKYellow: [WebColors.White, WebColors.Yellow],
    CMYKBlack: [WebColors.White, WebColors.Black]
};
