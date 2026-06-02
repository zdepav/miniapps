import RGBColor, { WebColors } from '@/RGBColor';
import { Optional } from '@/utils';


export abstract class PickerBlock {
    readonly element: HTMLElement;
    readonly width: number;
    readonly height: number;
    module: Optional<PickerModule>;

    protected constructor(element: HTMLElement, width: number, height: number) {
        this.element = element;
        this.width = width;
        this.height = height;
        this.module = null;
    }
}


export abstract class PickerInput extends PickerBlock {
    dataKey: string;

    protected constructor(
        elementClass: string,
        title: string,
        dataKey: string,
        width: number,
        height: number
    ) {
        const element: HTMLElement = document.createElement('div');
        element.classList.add(elementClass);
        element.title = title;
        super(element, width, height);
        this.dataKey = dataKey;
    }

    abstract setValue(value: number): void;
}


export abstract class PickerModule {
    private readonly cells: Array<Array<Optional<PickerBlock>>>;
    private readonly blocks: Array<PickerBlock>;
    private readonly gridElement: HTMLElement;
    private width: number;
    private height: number;

    protected readonly data: Record<string, number>;

    readonly colorPicker: ColorPicker;
    readonly element: HTMLElement;

    protected constructor(colorPicker: ColorPicker) {
        this.colorPicker = colorPicker;
        this.element = document.createElement('div');
        this.element.classList.add('module');
        colorPicker.element.appendChild(this.element);
        this.gridElement = document.createElement('div');
        this.gridElement.classList.add('grid');
        this.element.appendChild(this.gridElement);
        this.width = 0;
        this.height = 0;
        this.blocks = [];
        this.cells = [];
        this.data = {};
    }

    private expand(minWidth: number, minHeight: number): void {
        if (minHeight > this.height) {
            this.gridElement.style.height = `${3 * minHeight}rem`;
            this.gridElement.style.gridTemplateRows = `repeat(${minHeight},3rem)`;
            while (this.height < minHeight) {
                const row: Array<Optional<PickerInput>> = [];
                for (let i: number = 0; i < this.width; ++i) {
                    row.push(null);
                }
                this.cells.push(row);
                ++this.height;
            }
        }
        if (minWidth > this.width) {
            this.gridElement.style.width = `${3 * minWidth}rem`;
            this.gridElement.style.gridTemplateColumns = `repeat(${minWidth},3rem)`;
            while (this.width < minWidth) {
                for (let i: number = 0; i < this.height; ++i) {
                    this.cells[i].push(null);
                }
                ++this.width;
            }
        }
    }

    addBlock<T extends PickerBlock>(x: number, y: number, block: T): T {
        if (block.module != null) {
            block.module.removeBlock(block);
        }
        this.expand(x + block.width, y + block.height);
        for (let i: number = 0; i < block.width; ++i) {
            for (let j: number = 0; j < block.height; ++j) {
                if (this.cells[y + j][x + i] != null) {
                    throw new Error('Blocks and inputs in a module can\'t overlap');
                }
                this.cells[y + j][x + i] = block;
            }
        }
        this.blocks.push(block);
        block.module = this;
        block.element.style.gridArea = (
            `${y + 1} / ${x + 1} / span ${block.height} / span ${block.width}`
        );
        this.gridElement.appendChild(block.element);
        return block;
    }

    removeBlock(block: PickerBlock): void {
        const index: number = this.blocks.indexOf(block);
        if (index < 0) {
            return;
        }
        this.blocks.splice(index, 1);
        for (let i: number = 0; i < this.width; ++i) {
            for (let j: number = 0; j < this.height; ++j) {
                if (this.cells[j][i] == block) {
                    this.cells[j][i] = null;
                }
            }
        }
        block.element.remove();
    }

    setData(key: string | PickerInput, value: number): void {
        let source: Optional<PickerInput> = null;
        if (typeof key != 'string') {
            source = key;
            key = key.dataKey;
        }
        this.data[key] = value;
        for (const block of this.blocks) {
            if (block instanceof PickerInput && block.dataKey == key && block != source) {
                block.setValue(value);
            }
        }
        if (source != null) {
            this.onChange(key);
        }
    }

    setBool(key: string | PickerInput, value: boolean): void {
        this.setData(key, value ? 1 : 0);
    }

    getData(key: string, defaultValue: number): number {
        return key in this.data ? this.data[key] : defaultValue;
    }

    getBool(key: string, defaultValue: boolean): boolean {
        return key in this.data ? this.data[key] >= 0.5 : defaultValue;
    }

    protected abstract onChange(key: string): void;

    abstract update(color: RGBColor): void;

    abstract reconfigure(): void;
}

export interface ColorModuleConstructor<T extends PickerModule> {
    new (colorPicker: ColorPicker): T;
}

const PALETTE_STORAGE_REGEX: RegExp = /^miniapps.ColorPicker\.palette\.(.+)$/;

export default class ColorPicker {
    private readonly config: Record<string, any>;

    readonly element: HTMLElement;
    readonly modules: Array<PickerModule>;
    readonly palette: Record<string, RGBColor>;

    get relativeSliders(): boolean {
        return 'relativeSliders' in this.config ? this.config.relativeSliders : false;
    }

    set relativeSliders(value: boolean) {
        this.config.relativeSliders = value;
        for (const module of this.modules) {
            module.reconfigure();
        }
    }

    constructor(element: HTMLElement) {
        this.element = element;
        this.modules = [];
        this.palette = {};
        this.config = { relativeSliders: true };
        for (const key in localStorage) {
            const match: Optional<RegExpMatchArray> = PALETTE_STORAGE_REGEX.exec(key);
            if (match != null) {
                const color: Optional<RGBColor> = RGBColor.deserialize(localStorage.getItem(key)!);
                if (color != null) {
                    this.palette[match[1]] = color;
                }
            }
        }
    }

    addModule<T extends PickerModule>(ModuleConstructor: ColorModuleConstructor<T>): T {
        const module: T = new ModuleConstructor(this);
        this.modules.push(module);
        return module;
    }

    getPaletteColor(id: string): RGBColor {
        return id in this.palette ? this.palette[id] : WebColors.Black;
    }

    setPaletteColor(id: string, color: RGBColor): void {
        this.palette[id] = color;
        localStorage.setItem(`miniapps.ColorPicker.palette.${id}`, color.serialize());
    }

    update(source: Optional<PickerModule>, color: RGBColor): void {
        for (const module of this.modules) if (module !== source) {
            module.update(color);
        }
    }
}
