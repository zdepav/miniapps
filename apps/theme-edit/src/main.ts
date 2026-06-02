import LAYOUT from '@/layout';
import CodeGen from '@/CodeGen';
import Color from '@/Color';
import ColorSet from '@/ColorSet';
import '@/style.sass';
import { DEBUG, PREFIX } from '@/config';

function writeStylesheet(sass: boolean, indented: boolean): void {
    CodeGen.text('\n');
    CodeGen.selector('html');
    CodeGen.text(', ');
    CodeGen.selector('body');
    CodeGen.text(indented ? '\n' : ' {\n');
    for (const prop of [['background-color', 'bg'], ['color', 'fg']]) {
        CodeGen.text('  ');
        CodeGen.prop(prop[0]);
        CodeGen.text(': ');
        if (sass) {
            CodeGen.prop(`\$${PREFIX}-${prop[1]}`);
            CodeGen.text(indented ? '\n' : ';\n');
        } else {
            CodeGen.kw('var');
            CodeGen.text('(');
            CodeGen.prop(`--${PREFIX}-${prop[1]}`);
            CodeGen.text(');\n');
        }
    }
    CodeGen.prop('  font-family');
    CodeGen.text(': ');
    CodeGen.kw('sans-serif');
    CodeGen.text(indented ? '\n' : ';\n');
    for (const prop of ['margin', 'padding']) {
        CodeGen.text('  ');
        CodeGen.prop(prop);
        CodeGen.text(': ');
        CodeGen.val('0');
        CodeGen.text(indented ? '\n' : ';\n');
    }
    if (!indented) {
        CodeGen.text('}');
    }
}

function update(): void {
    const colors = new ColorSet();
    const base: Color = Color.parse(LAYOUT.inputColorBase);
    const back: Color = Color.parse(LAYOUT.inputColorBack);
    const text: Color = Color.parse(LAYOUT.inputColorText);
    const err: Color = base.toHue(LAYOUT.inputHueError);
    const warn: Color = base.toHue(LAYOUT.inputHueWarning);
    const ok: Color = base.toHue(LAYOUT.InputHueOk);

    // save valid inputs
    localStorage.setItem('miniapps.ThemeEdit.base', LAYOUT.inputColorBase.value);
    localStorage.setItem('miniapps.ThemeEdit.back', LAYOUT.inputColorBack.value);
    localStorage.setItem('miniapps.ThemeEdit.text', LAYOUT.inputColorText.value);
    localStorage.setItem('miniapps.ThemeEdit.err', LAYOUT.inputHueError.value);
    localStorage.setItem('miniapps.ThemeEdit.warn', LAYOUT.inputHueWarning.value);
    localStorage.setItem('miniapps.ThemeEdit.ok', LAYOUT.InputHueOk.value);

    // compute colors
    colors.add('bg', back, 'Background');
    colors.add('fg', text, 'Foreground (text)');
    colors.add('accent', base, 'Accent');
    colors.add('accent-bg', base.lerp(back, 0.75));
    colors.add('accent-bg-2', base.lerp(back, 0.5));
    colors.add('accent-fg', base.lerp(text, 0.5));
    colors.add('accent-fg-2', base.lerp(text, 0.75));
    colors.add('err', err);
    colors.add('err-bg', err.lerp(back, 0.75));
    colors.add('err-fg', err.lerp(text, 0.75));
    colors.add('warn', warn);
    colors.add('warn-bg', warn.lerp(back, 0.75));
    colors.add('warn-fg', warn.lerp(text, 0.75));
    colors.add('ok', ok);
    colors.add('ok-bg', ok.lerp(back, 0.75));
    colors.add('ok-fg', ok.lerp(text, 0.75));
    colors.apply(LAYOUT.container);

    // generate stylesheet
    CodeGen.clear();
    switch (LAYOUT.inputLang.value) {
        case 'scss':
            colors.writeSCSS();
            writeStylesheet(true, false);
            localStorage.setItem('miniapps.ThemeEdit.lang', 'scss');
            break;
        case 'sass':
            colors.writeSass();
            writeStylesheet(true, true);
            localStorage.setItem('miniapps.ThemeEdit.lang', 'sass');
            break;
        default:
            colors.writeCSS();
            writeStylesheet(false, false);
            localStorage.setItem('miniapps.ThemeEdit.lang', 'css');
            break;
    }
}

function invert(): void {
    const base: Color = Color.parse(LAYOUT.inputColorBase).hueSafeInvert();
    const back: Color = Color.parse(LAYOUT.inputColorBack).hueSafeInvert();
    const text: Color = Color.parse(LAYOUT.inputColorText).hueSafeInvert();
    LAYOUT.inputColorBase.value = base.hex;
    LAYOUT.inputColorBack.value = back.hex;
    LAYOUT.inputColorText.value = text.hex;
    update();
}

function tryUpdate(): void {
    try {
        update();
    } catch (error) {
        if (DEBUG) {
            console.error(error);
        }
    }
}

function tryInvert(): void {
    try {
        invert();
    } catch (error) {
        if (DEBUG) {
            console.error(error);
        }
    }
}

LAYOUT.inputColorBack.addEventListener('input', tryUpdate);
LAYOUT.inputColorText.addEventListener('input', tryUpdate);
LAYOUT.inputColorBase.addEventListener('input', tryUpdate);
LAYOUT.inputHueError.addEventListener('input', tryUpdate);
LAYOUT.inputHueWarning.addEventListener('input', tryUpdate);
LAYOUT.InputHueOk.addEventListener('input', tryUpdate);
LAYOUT.inputLang.addEventListener('input', tryUpdate);
LAYOUT.buttonInvert.addEventListener('click', tryInvert);

LAYOUT.stylesheetSelect.addEventListener('click', (): void => {
    const selection: Selection = window.getSelection()!;
    selection.removeAllRanges();
    const range: Range = document.createRange();
    range.selectNodeContents(LAYOUT.stylesheet);
    selection.addRange(range);
});

function restoreOr(key: string, defaultValue: string): string {
    return localStorage.getItem(key) ?? defaultValue;
}

// restore saved-values
LAYOUT.inputColorBase.value = restoreOr('miniapps.ThemeEdit.base', '#535D81');
LAYOUT.inputColorBack.value = restoreOr('miniapps.ThemeEdit.back', '#222');
LAYOUT.inputColorText.value = restoreOr('miniapps.ThemeEdit.text', '#EEE');
LAYOUT.inputHueError.value = restoreOr('miniapps.ThemeEdit.err', '0');
LAYOUT.inputHueWarning.value = restoreOr('miniapps.ThemeEdit.warn', '44');
LAYOUT.InputHueOk.value = restoreOr('miniapps.ThemeEdit.ok', '110');
LAYOUT.inputLang.value = restoreOr('miniapps.ThemeEdit.lang', 'css');

tryUpdate();
