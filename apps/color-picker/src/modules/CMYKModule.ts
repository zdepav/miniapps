import RGBColor, { WebColors, WebColorSets } from '@/RGBColor';
import ColorPicker, { PickerModule } from '@/ColorPicker';
import { Tuple4 } from '@/utils';
import NumericInput from '@/inputs/NumericInput';
import Slider from '@/inputs/Slider';
import Title from '@/blocks/Title';

export default class CMYKModule extends PickerModule {
    private relativeSliders: boolean;

    cyanSlider: Slider;
    magentaSlider: Slider;
    yellowSlider: Slider;
    blackSlider: Slider;

    constructor(colorPicker: ColorPicker) {
        super(colorPicker);
        this.relativeSliders = colorPicker.relativeSliders;

        // Cyan
        this.addBlock(0, 0, new Title('C', 1, 1, 3));
        this.cyanSlider = new Slider('Cyan', 'c', 5,
            this.relativeSliders ? [WebColors.Black] : WebColorSets.CMYKCyan
        );
        this.addBlock(1, 0, this.cyanSlider);
        this.addBlock(6, 0, new NumericInput('Cyan', 'c', 1, 0, 100));

        // Magenta
        this.addBlock(0, 1, new Title('M', 1, 1, 3));
        this.magentaSlider = new Slider('Magenta', 'm', 5,
            this.relativeSliders ? [WebColors.Black] : WebColorSets.CMYKMagenta
        );
        this.addBlock(1, 1, this.magentaSlider);
        this.addBlock(6, 1, new NumericInput('Magenta', 'm', 1, 0, 100));

        // Yellow
        this.addBlock(0, 2, new Title('Y', 1, 1, 3));
        this.yellowSlider = new Slider('Yellow', 'y', 5,
            this.relativeSliders ? [WebColors.Black] : WebColorSets.CMYKYellow
        );
        this.addBlock(1, 2, this.yellowSlider);
        this.addBlock(6, 2, new NumericInput('Yellow', 'y', 1, 0, 100));

        // Black
        this.addBlock(0, 3, new Title('K', 1, 1, 3));
        this.blackSlider = new Slider('Black', 'k', 5, WebColorSets.CMYKBlack);
        this.blackSlider.setValue(1);
        this.addBlock(1, 3, this.blackSlider);
        this.addBlock(6, 3, new NumericInput('Black', 'k', 1, 0, 100));
    }

    protected onChange(): void {
        const cyan: number = this.getData('c', 0);
        const magenta: number = this.getData('m', 0);
        const yellow: number = this.getData('y', 0);
        const black: number = this.getData('k', 0);
        this.colorPicker.update(this, RGBColor.fromCMYK(cyan, magenta, yellow, black));
        if (this.relativeSliders) {
            this.recolorSliders(cyan, magenta, yellow, black);
        }
    }

    private recolorSliders(cyan: number, magenta: number, yellow: number, black: number): void {
        this.cyanSlider.recolor([
            RGBColor.fromCMYK(0, magenta, yellow, black),
            RGBColor.fromCMYK(1, magenta, yellow, black)
        ]);
        this.magentaSlider.recolor([
            RGBColor.fromCMYK(cyan, 0, yellow, black),
            RGBColor.fromCMYK(cyan, 1, yellow, black)
        ]);
        this.yellowSlider.recolor([
            RGBColor.fromCMYK(cyan, magenta, 0, black),
            RGBColor.fromCMYK(cyan, magenta, 1, black)
        ]);
        this.blackSlider.recolor([
            RGBColor.fromCMYK(cyan, magenta, yellow, 0),
            RGBColor.fromCMYK(cyan, magenta, yellow, 1)
        ]);
    }

    update(color: RGBColor): void {
        const cmyk: Tuple4<number> = color.toCMYK();
        this.setData('c', cmyk[0]);
        this.setData('m', cmyk[1]);
        this.setData('y', cmyk[2]);
        this.setData('k', cmyk[3]);
        if (this.relativeSliders) {
            this.recolorSliders(cmyk[0], cmyk[1], cmyk[2], cmyk[3]);
        }
    }

    reconfigure(): void {
        if (this.relativeSliders != this.colorPicker.relativeSliders) {
            this.relativeSliders = this.colorPicker.relativeSliders;
            if (this.relativeSliders) {
                this.recolorSliders(
                    this.getData('c', 0), this.getData('m', 0),
                    this.getData('y', 0), this.getData('k', 0)
                );
            } else {
                this.cyanSlider.recolor(WebColorSets.CMYKCyan);
                this.magentaSlider.recolor(WebColorSets.CMYKMagenta);
                this.yellowSlider.recolor(WebColorSets.CMYKYellow);
                this.blackSlider.recolor(WebColorSets.CMYKBlack);
            }
        }
    }
}
