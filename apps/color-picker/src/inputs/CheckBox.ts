import { PickerInput } from '@/ColorPicker';
import { noDrag } from '@/utils';

export default class CheckBox extends PickerInput {
    private readonly inputElement: HTMLInputElement;

    constructor(title: string, dataKey: string) {
        super('checkbox', title, dataKey, 1, 1);
        const label: HTMLLabelElement = document.createElement('label');
        noDrag(label);
        this.inputElement = document.createElement('input');
        this.inputElement.type = 'checkbox';
        this.inputElement.autocomplete = 'off';
        this.inputElement.addEventListener('change', (): void => {
            this.module?.setBool(this, this.inputElement.checked);
        });
        label.appendChild(this.inputElement);
        const outerDiv: HTMLElement = document.createElement('div');
        const innerDiv: HTMLElement = document.createElement('div');
        outerDiv.appendChild(innerDiv);
        label.appendChild(outerDiv);
        this.element.appendChild(label);
    }

    setValue(value: number): void {
        this.inputElement.checked = value >= 0.5;
    }
}
