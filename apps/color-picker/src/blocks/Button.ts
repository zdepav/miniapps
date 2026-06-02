import { PickerBlock } from '@/ColorPicker';
import { noDrag, Optional } from '@/utils';


type OnClick = () => void;


export default class Button extends PickerBlock {
    onClick: Optional<OnClick> = null;
    private _disabled: boolean;

    get disabled(): boolean { return this._disabled; }

    set disabled(value: boolean) {
        this._disabled = value;
        this.element.classList.toggle('disabled', value);
    }

    constructor(label: string, title: string, width: number, height: number = 1) {
        super(document.createElement('div'), width, height);
        noDrag(this.element);
        this.element.innerText = label;
        this.element.classList.add('button');
        this.element.title = title;
        this.element.addEventListener('click', (): void => {
            if (this.onClick != null && !this._disabled) {
                this.onClick();
            }
        });
        this._disabled = false;
    }
}
