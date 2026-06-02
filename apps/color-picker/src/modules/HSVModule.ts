import RGBColor, { WebColors, WebColorSets } from '@/RGBColor';
import ColorPicker, { PickerModule } from '@/ColorPicker';
import { Tuple3 } from '@/utils';
import NumericInput from '@/inputs/NumericInput';
import Slider from '@/inputs/Slider';
import Title from '@/blocks/Title';

export default class HSVModule extends PickerModule {
    private relativeSliders: boolean;

    hueSlider: Slider;
    saturationSlider: Slider;
    valueSlider: Slider;

    constructor(colorPicker: ColorPicker) {
        super(colorPicker);
        this.relativeSliders = colorPicker.relativeSliders;

        // Hue
        this.addBlock(0, 0, new Title('H', 1, 1, 3));
        this.hueSlider = new Slider('Hue', 'h', 5,
            this.relativeSliders ? [WebColors.Black] : WebColorSets.Hue
        );
        this.addBlock(1, 0, this.hueSlider);
        this.addBlock(6, 0, new NumericInput('Hue', 'h', 1, 0, 360));

        // Saturation
        this.addBlock(0, 1, new Title('S', 1, 1, 3));
        this.saturationSlider = new Slider('Saturation', 's', 5,
            this.relativeSliders ? [WebColors.Black] : WebColorSets.HSVSaturation
        );
        this.addBlock(1, 1, this.saturationSlider);
        this.addBlock(6, 1, new NumericInput('Saturation', 's', 1, 0, 100));

        // Value
        this.addBlock(0, 2, new Title('V', 1, 1, 3));
        this.valueSlider = new Slider('Value', 'v', 5, WebColorSets.Light);
        this.addBlock(1, 2, this.valueSlider);
        this.addBlock(6, 2, new NumericInput('Value', 'v', 1, 0, 100));
    }

    protected onChange(): void {
        const hue: number = this.getData('h', 0);
        const saturation: number = this.getData('s', 0);
        const value: number = this.getData('v', 0);
        this.colorPicker.update(this, RGBColor.fromHSV(hue, saturation, value));
        if (this.relativeSliders) {
            this.recolorSliders(hue, saturation, value);
        }
    }

    private recolorSliders(hue: number, saturation: number, value: number): void {
        this.hueSlider.recolor([
            RGBColor.fromHSV(0, saturation, value),
            RGBColor.fromHSV(1 / 6, saturation, value),
            RGBColor.fromHSV(1 / 3, saturation, value),
            RGBColor.fromHSV(0.5, saturation, value),
            RGBColor.fromHSV(2 / 3, saturation, value),
            RGBColor.fromHSV(5 / 6, saturation, value),
            RGBColor.fromHSV(1, saturation, value)
        ]);
        this.saturationSlider.recolor([
            RGBColor.fromHSV(hue, 0, value),
            RGBColor.fromHSV(hue, 1, value)
        ]);
        this.valueSlider.recolor([
            RGBColor.fromHSV(hue, saturation, 0),
            RGBColor.fromHSV(hue, saturation, 1)
        ]);
    }

    update(color: RGBColor): void {
        const hsv: Tuple3<number> = color.toHSV();
        this.setData('h', hsv[0]);
        this.setData('s', hsv[1]);
        this.setData('v', hsv[2]);
        if (this.relativeSliders) {
            this.recolorSliders(hsv[0], hsv[1], hsv[2]);
        }
    }

    reconfigure(): void {
        if (this.relativeSliders != this.colorPicker.relativeSliders) {
            this.relativeSliders = this.colorPicker.relativeSliders;
            if (this.relativeSliders) {
                this.recolorSliders(
                    this.getData('h', 0),
                    this.getData('s', 0),
                    this.getData('v', 0)
                );
            } else {
                this.hueSlider.recolor(WebColorSets.Hue);
                this.saturationSlider.recolor(WebColorSets.HSVSaturation);
                this.valueSlider.recolor(WebColorSets.Light);
            }
        }
    }
}
