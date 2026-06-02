import RGBColor, { WebColorSets } from '@/RGBColor';
import ColorPicker, { PickerModule } from '@/ColorPicker';
import { CSS } from '@/utils';
import HexInput from '@/inputs/HexInput';
import NumericInput from '@/inputs/NumericInput';
import Slider from '@/inputs/Slider';
import TextBox from '@/blocks/TextBox';
import Title from '@/blocks/Title';

export default class RGBModule extends PickerModule {
    private relativeSliders: boolean;

    redSlider: Slider;
    greenSlider: Slider;
    blueSlider: Slider;
    hexInput: HexInput;
    cssTextBox: TextBox;

    constructor(colorPicker: ColorPicker) {
        super(colorPicker);
        this.relativeSliders = colorPicker.relativeSliders;

        // Red
        this.addBlock(0, 0, new Title('R', 1, 1, 3));
        this.redSlider = new Slider('Red', 'r', 5, WebColorSets.Red);
        this.addBlock(1, 0, this.redSlider);
        this.addBlock(6, 0, new NumericInput('Red', 'r', 1, 0, 255));

        // Green
        this.addBlock(0, 1, new Title('G', 1, 1, 3));
        this.greenSlider = new Slider('Green', 'g', 5, WebColorSets.Green);
        this.addBlock(1, 1, this.greenSlider);
        this.addBlock(6, 1, new NumericInput('Green', 'g', 1, 0, 255));

        // Blue
        this.addBlock(0, 2, new Title('B', 1, 1, 3));
        this.blueSlider = new Slider('Blue', 'b', 5, WebColorSets.Blue);
        this.addBlock(1, 2, this.blueSlider);
        this.addBlock(6, 2, new NumericInput('Blue', 'b', 1, 0, 255));

        // CSS
        this.addBlock(0, 3, new Title('CSS', 1, 1, 1));
        this.hexInput = new HexInput('HEX color', 2);
        this.addBlock(1, 3, this.hexInput);
        this.cssTextBox = new TextBox('CSS color', 4, 1, true);
        this.addBlock(3, 3, this.cssTextBox);
        this.cssTextBox.setText('rgb(0, 0, 0)');
    }

    protected onChange(key: string): void {
        let color: RGBColor;
        if (key == 'hex') {
            const int32: number = this.getData('hex', 0);
            color = RGBColor.fromInt32RGB(int32);
            this.setData('r', color.r);
            this.setData('g', color.g);
            this.setData('b', color.b);
        } else {
            color = new RGBColor(this.getData('r', 0), this.getData('g', 0), this.getData('b', 0));
            this.setData('hex', color.toInt32RGB());
        }
        this.cssTextBox.setText(
            `rgb(${CSS.byte(color.r)}, ${CSS.byte(color.g)}, ${CSS.byte(color.b)})`
        );
        this.colorPicker.update(this, color);
        if (this.relativeSliders) {
            this.recolorSliders(color.r, color.g, color.b);
        }
    }

    private recolorSliders(red: number, green: number, blue: number): void {
        this.redSlider.recolor([new RGBColor(0, green, blue), new RGBColor(1, green, blue)]);
        this.greenSlider.recolor([new RGBColor(red, 0, blue), new RGBColor(red, 1, blue)]);
        this.blueSlider.recolor([new RGBColor(red, green, 0), new RGBColor(red, green, 1)]);
    }

    update(color: RGBColor): void {
        this.setData('r', color.r);
        this.setData('g', color.g);
        this.setData('b', color.b);
        this.setData('hex', color.toInt32RGB());
        this.cssTextBox.setText(
            `rgb(${CSS.byte(color.r)}, ${CSS.byte(color.g)}, ${CSS.byte(color.b)})`
        );
        if (this.relativeSliders) {
            this.recolorSliders(color.r, color.g, color.b);
        }
    }

    reconfigure(): void {
        if (this.relativeSliders != this.colorPicker.relativeSliders) {
            this.relativeSliders = this.colorPicker.relativeSliders;
            if (this.relativeSliders) {
                this.recolorSliders(
                    this.getData('r', 0),
                    this.getData('g', 0),
                    this.getData('b', 0)
                );
            } else {
                this.redSlider.recolor(WebColorSets.Red);
                this.greenSlider.recolor(WebColorSets.Green);
                this.blueSlider.recolor(WebColorSets.Blue);
            }
        }
    }
}
