import { PickerInput } from '@/ColorPicker';
import RGBColor from '@/RGBColor';
import { Optional, clamp, noDrag } from '@/utils';

export default class HexInput extends PickerInput {
    private readonly inputElement: HTMLInputElement;
    private val: number;

    constructor(title: string, width: number) {
        super('hex', title, 'hex', width, 1);
        this.val = 0;
        this.inputElement = document.createElement('input');
        noDrag(this.inputElement);
        this.inputElement.addEventListener('input', (): void => {
            const value: Optional<number> = RGBColor.hexToInt32RGB(<string>this.inputElement.value);
            if (value == null) {
                this.setValidity('Invalid hex color');
            } else {
                this.val = value;
                this.module?.setData(this, value);
                this.setValidity();
            }
        });
        this.inputElement.type = 'text';
        this.inputElement.value = '#000';
        this.element.appendChild(this.inputElement);
    }

    setValidity(comment?: string): void {
        this.inputElement.setCustomValidity(comment ?? '');
    }

    setValue(value: number): void {
        this.val = clamp(Math.round(value), 0, 0xffffff);
        this.inputElement.value = RGBColor.int32RGBToHex(this.val);
        this.setValidity();
    }
}
