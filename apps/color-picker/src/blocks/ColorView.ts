import { PickerBlock } from '@/ColorPicker';
import { noDrag } from '@/utils';
import RGBColor from '@/RGBColor';


export default class ColorView extends PickerBlock {

    constructor(width: number, height: number) {
        super(document.createElement('div'), width, height);
        noDrag(this.element);
        this.element.classList.add('color-view');
    }

    setColor(color: RGBColor): void {
        this.element.style.setProperty('--color', color.toHex());
    }
}
