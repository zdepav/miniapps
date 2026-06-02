import { PickerInput } from '@/ColorPicker';
import { clamp, noDrag } from '@/utils';

export default class NumericInput extends PickerInput {
    private readonly inputElement: HTMLInputElement;
    private readonly min: number;
    private readonly max: number;
    private val: number;

    constructor(title: string, dataKey: string, width: number, min: number, max: number) {
        super('numeric', title, dataKey, width, 1);
        this.min = min;
        this.max = max;
        this.val = 0 >= min && 0 <= max ? 0 : min;
        this.inputElement = document.createElement('input');
        noDrag(this.inputElement);
        this.inputElement.addEventListener('input', (): void => {
            const valstr: string = <string>this.inputElement.value;
            let sign: number = 0;
            let inValue: boolean = false; // found at least one digit
            let value: number = 0;
            let nstr: string = '';
            for (let i: number = 0; i < valstr.length; ++i) {
                const char: number = valstr.charCodeAt(i);
                if (char == 45 && !inValue && sign == 0) {
                    sign = -1;
                    nstr += '-';
                } if (char == 43 && !inValue && sign == 0) {
                    sign = 1;
                    nstr += '+';
                } else if (char >= 48 && char <= 57) {
                    inValue = true;
                    value = (value * 10) + (char - 48);
                    nstr += valstr.charAt(i);
                }
            }
            if (nstr != valstr) {
                this.inputElement.value = nstr; // removing invalid characters
            }
            if (sign != 0) {
                value *= sign;
            }
            if (inValue && value >= min && value <= max) {
                this.val = value;
                this.module?.setData(this, (this.val - this.min) / (this.max - this.min));
                this.setValidity();
            } else {
                this.setValidity('Out of range');
            }
        });
        this.inputElement.type = 'text';
        this.inputElement.value = this.val.toString();
        this.element.appendChild(this.inputElement);
    }

    setValidity(comment?: string): void {
        this.inputElement.setCustomValidity(comment ?? '');
    }

    setValue(value: number): void {
        this.val = Math.round(clamp(value) * (this.max - this.min) + this.min);
        this.inputElement.value = this.val.toString();
        this.setValidity();
    }
}
