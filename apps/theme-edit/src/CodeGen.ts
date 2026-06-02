import LAYOUT from '@/layout';

export default class CodeGen {

    private static token(txt: string, cls: string): HTMLSpanElement {
        const elem: HTMLSpanElement = document.createElement('span');
        elem.innerText = txt;
        elem.classList.add(cls);
        LAYOUT.stylesheet.appendChild(elem);
        return elem;
    }

    static clear(): void {
        LAYOUT.stylesheet.innerHTML = '';
    }

    static text(txt: string): void {
        LAYOUT.stylesheet.appendChild(document.createTextNode(txt));
    }

    static selector(txt: string): void {
        CodeGen.token(txt, 'selector');
    }

    static kw(txt: string): void {
        CodeGen.token(txt, 'kw');
    }

    static val(txt: string): void {
        CodeGen.token(txt, 'val');
    }

    static prop(txt: string): void {
        CodeGen.token(txt, 'prop');
    }

    static comment(txt: string): void {
        CodeGen.token(txt, 'comment');
    }

    static color(color: string): void {
        CodeGen.token(color, 'color').style.setProperty('--color', color);
    }
}
