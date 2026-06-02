import RGBColor, { WebColors, WebColorSets } from '@/RGBColor';
import ColorPicker, { PickerModule } from '@/ColorPicker';
import { CSS, Tuple3 } from '@/utils';
import NumericInput from '@/inputs/NumericInput';
import Slider from '@/inputs/Slider';
import TextBox from '@/blocks/TextBox';
import Title from '@/blocks/Title';

export default class HSLModule extends PickerModule {
    private relativeSliders: boolean;

    hueSlider: Slider;
    saturationSlider: Slider;
    lightnessSlider: Slider;
    cssTextBox: TextBox;

    constructor(colorPicker: ColorPicker) {
        super(colorPicker);
        this.relativeSliders = colorPicker.relativeSliders;

        // Hue
        this.addBlock(0, 0, new Title('H', 1, 1, 3));
        this.hueSlider = new Slider('Hue', 'h', 5,
            colorPicker.relativeSliders ? [WebColors.Black] : WebColorSets.Hue
        );
        this.addBlock(1, 0, this.hueSlider);
        this.addBlock(6, 0, new NumericInput('Hue', 'h', 1, 0, 360));

        // Saturation
        this.addBlock(0, 1, new Title('S', 1, 1, 3));
        this.saturationSlider = new Slider('Saturation', 's', 5,
            colorPicker.relativeSliders ? [WebColors.Black] : WebColorSets.HSLSaturation
        );
        this.addBlock(1, 1, this.saturationSlider);
        this.addBlock(6, 1, new NumericInput('Saturation', 's', 1, 0, 100));

        // Lightness
        this.addBlock(0, 2, new Title('L', 1, 1, 3));
        this.lightnessSlider = new Slider('Lightness', 'l', 5, WebColorSets.Light);
        this.addBlock(1, 2, this.lightnessSlider);
        this.addBlock(6, 2, new NumericInput('Lightness', 'l', 1, 0, 100));

        // CSS
        this.addBlock(0, 3, new Title('CSS', 1, 1, 1));
        this.cssTextBox = new TextBox('CSS color', 6, 1, true);
        this.addBlock(1, 3, this.cssTextBox);
        this.cssTextBox.setText('hsl(0 0 0)');
    }

    protected onChange(): void {
        const hue: number = this.getData('h', 0);
        const saturation: number = this.getData('s', 0);
        const lightness: number = this.getData('l', 0);
        this.cssTextBox.setText(
            `hsl(${CSS.deg(hue)} ${CSS.percent(saturation)} ${CSS.percent(lightness)})`
        );
        this.colorPicker.update(this, RGBColor.fromHSL(hue, saturation, lightness));
        if (this.relativeSliders) {
            this.recolorSliders(hue, saturation, lightness);
        }
    }

    private recolorSliders(hue: number, saturation: number, lightness: number): void {
        this.hueSlider.recolor([
            RGBColor.fromHSL(0, saturation, lightness),
            RGBColor.fromHSL(1 / 6, saturation, lightness),
            RGBColor.fromHSL(1 / 3, saturation, lightness),
            RGBColor.fromHSL(0.5, saturation, lightness),
            RGBColor.fromHSL(2 / 3, saturation, lightness),
            RGBColor.fromHSL(5 / 6, saturation, lightness),
            RGBColor.fromHSL(1, saturation, lightness)
        ]);
        this.saturationSlider.recolor([
            RGBColor.fromHSL(hue, 0, lightness),
            RGBColor.fromHSL(hue, 1, lightness)
        ]);
        this.lightnessSlider.recolor([
            RGBColor.fromHSL(hue, saturation, 0),
            RGBColor.fromHSL(hue, saturation, 0.5),
            RGBColor.fromHSL(hue, saturation, 1)
        ]);
    }

    update(color: RGBColor): void {
        const hsl: Tuple3<number> = color.toHSL();
        this.setData('h', hsl[0]);
        this.setData('s', hsl[1]);
        this.setData('l', hsl[2]);
        this.cssTextBox.setText(
            `hsl(${CSS.deg(hsl[0])} ${CSS.percent(hsl[1])} ${CSS.percent(hsl[2])})`
        );
        if (this.relativeSliders) {
            this.recolorSliders(hsl[0], hsl[1], hsl[2]);
        }
    }

    reconfigure(): void {
        if (this.relativeSliders != this.colorPicker.relativeSliders) {
            this.relativeSliders = this.colorPicker.relativeSliders;
            if (this.relativeSliders) {
                this.recolorSliders(
                    this.getData('h', 0),
                    this.getData('s', 0),
                    this.getData('l', 0)
                );
            } else {
                this.hueSlider.recolor(WebColorSets.Hue);
                this.saturationSlider.recolor(WebColorSets.HSLSaturation);
                this.lightnessSlider.recolor(WebColorSets.Light);
            }
        }
    }
}
