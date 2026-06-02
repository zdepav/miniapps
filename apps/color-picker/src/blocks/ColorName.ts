import TextBox from '@/blocks/TextBox';
import RGBColor, { WebColors } from '@/RGBColor';
import { Alignment } from '@/utils';


function colorDistance(a: RGBColor, b: RGBColor): number {
    // no sqrt() as we only need to compare distances, not the actual values
    return (b.r - a.r) * (b.r - a.r) + (b.g - a.g) * (b.g - a.g) + (b.b - a.b) * (b.b - a.b);
}


const DISTANCE_THRESHOLD: number = 0.05 * 0.05; // squared to be comparable to colorDistance


function findColorName(color: RGBColor): string {
    const names: Array<string> = Object.keys(WebColors);
    let bestName: string = names[0];
    let bestDistance: number = colorDistance(color, WebColors[bestName]);
    for (let i: number = 1; i < names.length; i++) {
        const name: string = names[i];
        const colorValue: RGBColor = WebColors[name];
        const distance: number = colorDistance(color, colorValue);
        if (distance < bestDistance) {
            bestName = name;
            bestDistance = distance;
        }
    }
    return bestDistance < DISTANCE_THRESHOLD ? bestName : 'unnamed';
}


export default class ColorName extends TextBox {

    constructor(width: number, height: number = 1, align: Alignment = 'center') {
        super("Web color name", width, height, false, align);
    }

    setColor(color: RGBColor): void {
        const name: string = findColorName(color);
        this.element.textContent = name;
        this.element.classList.toggle('dim', name === 'unnamed')
    }
}
