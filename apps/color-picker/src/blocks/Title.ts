import { PickerBlock } from '@/ColorPicker';
import { noDrag } from '@/utils';

export default class Title extends PickerBlock {

    constructor(
        title: string,
        width: number,
        height: number,
        size: number = 0,
        align: 'left' | 'right' | 'center' = 'center'
    ) {
        super(document.createElement('div'), width, height);
        noDrag(this.element);
        this.element.classList.add('title', `sz${size}`, align);
        this.element.innerText = title;
    }
}
