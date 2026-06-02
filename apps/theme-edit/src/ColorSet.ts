import Color from '@/Color';
import CodeGen from '@/CodeGen';
import { PREFIX } from '@/config';

export default class ColorSet {
    colors: Array<{ css: string, color: Color, name: string | null }>;

    constructor() {
        this.colors = [];
    }

    add(cssVarName: string, color: Color, name?: string | null): void {
        this.colors.push({ css: cssVarName, color, name: name == null ? null : name });
    }

    apply(element: HTMLElement): void {
        for (const item of this.colors) {
            element.style.setProperty('--ex-color-' + item.css, item.color.hex);
        }
    }

    writeCSS(): void {
        CodeGen.selector(':root');
        CodeGen.text(' {\n');
        for (const item of this.colors) {
            CodeGen.prop(`  --${PREFIX}-${item.css}`);
            CodeGen.text(': ');
            CodeGen.color(item.color.hex);
            if (item.name == null) {
                CodeGen.text(';\n');
            } else {
                CodeGen.text('; ');
                CodeGen.comment(`/* ${item.name} color */`);
                CodeGen.text('\n');
            }
        }
        CodeGen.text('}\n');
    }

    writeSCSS(): void {
        for (const item of this.colors) {
            CodeGen.prop(`\$${PREFIX}-${item.css}`);
            CodeGen.text(': ');
            CodeGen.color(item.color.hex);
            if (item.name == null) {
                CodeGen.text(';\n');
            } else {
                CodeGen.text('; ');
                CodeGen.comment(`/* ${item.name} color */`);
                CodeGen.text('\n');
            }
        }
    }

    writeSass(): void {
        for (const item of this.colors) {
            CodeGen.prop(`\$${PREFIX}-${item.css}`);
            CodeGen.text(': ');
            CodeGen.color(item.color.hex);
            if (item.name != null) {
                CodeGen.text(' ');
                CodeGen.comment(`// ${item.name} color`);
            }
            CodeGen.text('\n');
        }
    }
}
