import RGBColor from '@/RGBColor';
import ColorPicker, { PickerModule } from '@/ColorPicker';
import HSVWheel from '@/blocks/HSVWheel';

export default class HSVWheelModule extends PickerModule {
    private readonly wheel: HSVWheel;

    constructor(colorPicker: ColorPicker) {
        super(colorPicker);
        this.wheel = new HSVWheel();
        this.wheel.onChange = (color: RGBColor): void => {
            this.colorPicker.update(this, color);
        };
        this.addBlock(0, 0, this.wheel);
    }

    protected onChange(): void { }

    update(color: RGBColor): void {
        this.wheel.setColor(color);
    }

    reconfigure(): void { }
}
