import ColorPicker, { PickerModule } from '@/ColorPicker';
import ColorView from '@/blocks/ColorView';
import ColorName from '@/blocks/ColorName';
import RGBColor from '@/RGBColor';
import Title from '@/blocks/Title';


export default class PreviewModule extends PickerModule {
    colorView: ColorView;
    colorName: ColorName;

    constructor(colorPicker: ColorPicker) {
        super(colorPicker);
        this.addBlock(0, 0, new Title('Preview', 5, 1, 2));
        this.colorView = this.addBlock(0, 1, new ColorView(5, 3));
        this.colorName = this.addBlock(0, 4, new ColorName(5));
    }

    protected onChange(): void { }

    update(color: RGBColor): void {
        this.colorView.setColor(color);
        this.colorName.setColor(color);
    }

    reconfigure(): void { }
}
