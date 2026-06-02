import { PickerBlock } from '@/ColorPicker';
import { Alignment, noDrag } from '@/utils';

export default class TextBox extends PickerBlock {

    constructor(
        title: string,
        width: number,
        height: number = 1,
        code: boolean = false,
        align: Alignment = 'center'
    ) {
        super(document.createElement('div'), width, height);
        noDrag(this.element);
        this.element.classList.add('text', align);
        this.element.title = title;
        if (code) {
            this.element.classList.add('code');
        }
    }

    setText(text: string): void {
        this.element.innerText = text;
    }
}
