import ColorPicker, { PickerModule } from '@/ColorPicker';
import { Optional } from '@/utils';
import Title from '@/blocks/Title';
import CheckBox from '@/inputs/CheckBox';


const OPTION_DEFAULTS: Record<string, boolean> = {
    relativeSliders: true,
    sliderFadeout: false,
    debugGrid: false
};


const DEBUG: boolean = false;


export default class ConfigModule extends PickerModule {
    loading: boolean;
    keys: Record<string, string>;

    constructor(colorPicker: ColorPicker) {
        super(colorPicker);
        this.element.id = 'ma-color-picker-config';
        this.addBlock(0, 0, new Title('Configuration', 4, 1, 2));

        // Relative sliders
        this.addBlock(0, 1, new CheckBox('Relative sliders', 'relativeSliders'));
        this.addBlock(1, 1, new Title('Relative sliders', 3, 1, 0, 'left'));

        // Slider fade-out
        this.addBlock(0, 2, new CheckBox('Slider fade-out', 'sliderFadeout'));
        this.addBlock(1, 2, new Title('Slider fade-out', 3, 1, 0, 'left'));

        // Debug grid
        if (DEBUG) {
            this.addBlock(0, 3, new CheckBox('Debug grid', 'debugGrid'));
            this.addBlock(1, 3, new Title('Debug grid', 3, 1, 0, 'left'));
        }

        // Configuration
        this.loading = true;
        this.keys = {};
        for (const key in OPTION_DEFAULTS) {
            this.keys[key] = `miniapps.ColorPicker.${key}`;
            const val: Optional<string> = localStorage.getItem(this.keys[key]);
            this.setBool(key, val == null ? OPTION_DEFAULTS[key] : val == 'true');
            this.onChange(key);
        }
        this.loading = false;
    }

    protected onChange(key: string): void {
        const val: boolean = this.getBool(key, false);
        switch (key) {
            case 'relativeSliders':
                this.colorPicker.relativeSliders = val;
                break;
            case 'sliderFadeout':
                this.colorPicker.element.classList.toggle('slider-fadeout', val);
                break;
            case 'debugGrid':
                this.colorPicker.element.classList.toggle('debug', val);
                break;
        }
        if (!this.loading) {
            localStorage.setItem(this.keys[key], val ? 'true' : 'false');
        }
    }

    update(): void { }

    reconfigure(): void { }
}
