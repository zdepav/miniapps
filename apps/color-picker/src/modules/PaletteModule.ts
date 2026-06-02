import ColorPicker, { PickerModule } from '@/ColorPicker';
import ColorView from '@/blocks/ColorView';
import Button from '@/blocks/Button';
import RGBColor from '@/RGBColor';
import Title from '@/blocks/Title';


class PaletteSlot {
    index: number;
    name: string;
    color: RGBColor;
    view: ColorView;
    button: Button;
    colorPicker: ColorPicker;

    constructor(colorPicker: ColorPicker, index: number) {
        this.colorPicker = colorPicker;
        this.index = index;
        this.name = `Slot ${this.index + 1}`;
        this.color = colorPicker.getPaletteColor(this.name);
        this.view = new ColorView(1, 1);
        this.view.setColor(this.color);
        this.button = new Button(this.name, `Switch to slot ${this.index + 1}`, 2, 1);
    }

    update(color: RGBColor) {
        this.color = color;
        this.colorPicker.setPaletteColor(this.name, color);
        this.view.setColor(color);
    }
}


const SLOT_COUNT: number = 8;


export default class PaletteModule extends PickerModule {
    slots: Array<PaletteSlot>;
    private slotIndex: number;

    get selectedSlot(): PaletteSlot { return this.slots[this.slotIndex]; }

    constructor(colorPicker: ColorPicker) {
        super(colorPicker);
        this.addBlock(0, 0, new Title('Palette', 6, 1, 2));
        this.slots = [];
        for (let i: number = 0; i < SLOT_COUNT; i++) {
            const index: number = i;
            const slot: PaletteSlot = new PaletteSlot(colorPicker, index);
            slot.button.onClick = (): void => this.setSlot(index);
            this.slots.push(slot);
            const posX: number = Math.floor(i / 4) * 3;
            const posY: number = 1 + i % 4;
            this.addBlock(posX, posY, slot.view);
            this.addBlock(posX + 1, posY, slot.button);
        }
        this.slotIndex = -1; // invalid slot index for first setSlot call
    }

    setSlot(value: number): void {
        if (value === this.slotIndex) {
            return;
        } else if (!Number.isInteger(value) || value < 0 || value >= SLOT_COUNT) {
            throw new Error(`Invalid slot number: ${value}. Must be in [0, ${SLOT_COUNT}).`);
        }
        this.slotIndex = value;
        for (let i: number = 0; i < SLOT_COUNT; i++) {
            this.slots[i].button.disabled = i === value;
        }
        this.colorPicker.update(this, this.slots[value].color);
    }

    protected onChange(): void { }

    update(color: RGBColor): void {
        this.selectedSlot.update(color);
    }

    reconfigure(): void { }
}
