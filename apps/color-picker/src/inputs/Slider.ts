import RGBColor from '@/RGBColor';
import { PickerInput } from '@/ColorPicker';
import { clamp, noDrag } from '@/utils';

export default class Slider extends PickerInput {
    private readonly barInnerElement: HTMLElement;
    private readonly barOuterElement: HTMLElement;
    private readonly inputElement: HTMLInputElement;
    private val: number;

    colors: Array<RGBColor>;

    constructor(title: string, dataKey: string, width: number, colors: Array<RGBColor>) {
        super('slider', title, dataKey, width, 1);
        this.colors = colors;
        this.barOuterElement = document.createElement('div');
        this.barOuterElement.classList.add('bar');
        this.barInnerElement = document.createElement('div');
        this.barOuterElement.appendChild(this.barInnerElement);
        this.element.appendChild(this.barOuterElement);
        this.val = 0;
        this.inputElement = document.createElement('input');
        noDrag(this.inputElement);
        this.inputElement.addEventListener('input', (): void => {
            this.val = clamp(parseInt(this.inputElement.value) / 1000);
            this.updateKnobColor();
            this.module?.setData(this, this.val);
        });
        this.inputElement.type = 'range';
        this.inputElement.min = '0';
        this.inputElement.max = '1000';
        this.inputElement.value = '0';
        this.element.appendChild(this.inputElement);
        this.recolor(colors)
    }

    recolor(colors: Array<RGBColor>): void {
        if (colors.length === 1) {
            colors = [colors[0], colors[0]];
        }
        this.colors = colors;
        const css: Array<string> = colors.map((col: RGBColor): string => col.toHex());
        const lastCol: string = css[css.length - 1];
        this.barInnerElement.style.backgroundImage = `linear-gradient(to right,${css.join(',')})`;
        this.barOuterElement.style.backgroundImage = (
            `linear-gradient(to right,${css[0]},${css[0]} 50%,${lastCol} 50%,${lastCol})`
        );
        this.updateKnobColor();
    }

    private updateKnobColor(): void {
        const colorI: number = this.val * (this.colors.length - 1);
        const i: number = Math.floor(colorI);
        let color: RGBColor;
        if (colorI <= 0) {
            color = this.colors[0];
        } else if (i >= this.colors.length - 1) {
            color = this.colors[this.colors.length - 1];
        } else {
            color = this.colors[i].mix(this.colors[i + 1], colorI - i);
        }
        this.element.style.setProperty('--knob-color', color.toHex());
    }

    setValue(value: number): void {
        this.val = clamp(value);
        this.inputElement.value = Math.round(this.val * 1000).toString();
        this.updateKnobColor();
    }
}
