import { KILLER_SUMS } from '@/KillerSudoku';
import { $div, $input, $label, $span, Array2D, tryParseInt, Tuple10 } from '@/common';

export default class XSumsSudoku {
    readonly xs: Tuple10<boolean>;
    readonly digitFlags: Tuple10<number>;
    readonly resultDivs: Array2D<HTMLElement>;
    readonly container: HTMLElement;
    readonly sumInput: HTMLInputElement;

    sum: number;

    constructor(parent: HTMLElement) {
        this.sum = 20
        this.xs = [false, true, true, true, true, true, true, true, true, true];
        this.digitFlags = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.resultDivs = [[], [], []];
        this.container = $div(parent);
        this.container.id = 'ma-sudoku-xsums';
        this.sumInput = document.createElement('input');
        this.buildGUIHeader();
        this.buildGUI();
    }

    buildGUIHeader(): void {
        const header: HTMLElement = $div(this.container, 'header');
        $div(header, null, 'X');
        $div(header, null, 'Sums Sudoku');
    }

    buildGUI(): void {
        this.sumInput.type = 'text';
        this.sumInput.minLength = 1;
        this.sumInput.maxLength = 2;
        this.sumInput.pattern = '[1-9]|[123][0-9]|4[0-5]';
        this.sumInput.value = '20';
        this.sumInput.addEventListener('change', (): void => {
            const val: number = tryParseInt(this.sumInput.value);
            if (val >= 1 && val <= 45) {
                this.sum = val;
                this.update();
            }
        });
        const inputArea: HTMLElement = $div($div(this.container, 'row'), 'input-area');
        let table: HTMLElement = $div(inputArea, 'table');
        $div($div(table, 'column caption'), null, 'X-sum');
        $div(table, 'btn', '-').addEventListener('click', (): void => {
            if (this.sum > 1) {
                --this.sum;
                this.sumInput.value = `${this.sum}`;
                this.update();
            }
        });
        $div(table, 'textbox').appendChild(this.sumInput);
        $div(table, 'btn', '+').addEventListener('click', (): void => {
            if (this.sum < 45) {
                ++this.sum;
                this.sumInput.value = `${this.sum}`;
                this.update();
            }
        });
        table = $div(inputArea, 'table');
        $div($div(table, 'column caption'), null, 'X (first digit)');
        for (let x: number = 1; x < 10; ++x) {
            const column: HTMLElement = $div(table, 'column');
            const label: HTMLLabelElement = $label(column);
            const input: HTMLInputElement = $input(label);
            input.type = 'checkbox';
            input.name = `ma-sudoku-xsums-x${x}`;
            input.checked = true;
            input.addEventListener('change', (): void => {
                this.xs[x] = input.checked;
                this.update();
            });
            $span(label, null, String(x));
        }
        table = $div(inputArea, 'table');
        const captionGroup: HTMLElement = $div(table, 'column caption');
        $div(captionGroup, null, 'Must include');
        $div(captionGroup, null, 'Can include');
        $div(captionGroup, null, 'Can\'t include');
        for (let digit: number = 1; digit< 10; ++digit) {
            const column: HTMLElement = $div(table, 'column');
            for (let flag: number = 1; flag > -2; --flag) {
                const label: HTMLLabelElement = $label(column);
                const input: HTMLInputElement = $input(label);
                input.type = 'radio';
                input.name = `ma-sudoku-xsums-r${digit}`;
                input.checked = flag === 0;
                input.addEventListener('change', (): void => {
                    if (input.checked) {
                        this.digitFlags[digit] = flag
                        this.update()
                    }
                });
                $span(label, null, String(digit));
            }
        }
        const row: HTMLElement = $div(this.container, 'row');
        const results: Array<HTMLElement> = [
            $div(row, 'results'),
            $div(row, 'results'),
            $div(row, 'results')
        ];
        results[1].style.margin = '0 24px';
        for (let j: number = 0; j < 3; ++j) for (let i: number = 0; i < 5; ++i) {
            this.resultDivs[j].push($div(results[j]));
        }
        this.update()
    }

    checkDigits(digits: Array<number>, required: number): boolean {
        if (!this.xs[digits.length]) {
            return false;
        }
        for (const digit of digits) {
            if (this.digitFlags[digit] > 0) {
                --required;
            } else if (this.digitFlags[digit] < 0) {
                return false;
            }
        }
        return required === 0;
    }

    update(): void {
        let i: number = 0;
        for (; i < 3; ++i) for (const rdiv of this.resultDivs[i]) {
            rdiv.innerText = '';
        }
        if (this.sum < 1 || this.sum > 45) {
            return;
        }
        let required: number = 0;
        for (const flag of this.digitFlags) if (flag > 0) {
            ++required;
        }
        i = 0;
        for (let x: number = 1; x < 10; ++x) for (const digits of KILLER_SUMS[x][this.sum]) {
            if (digits.indexOf(digits.length) >= 0) {
                const result: HTMLElement = this.resultDivs[i % 3][Math.floor(i / 3)];
                const nonX: string = digits.filter(
                    (d: number): boolean => d != digits.length
                ).join(' ');
                result.innerText = `${digits.length} ${nonX}`;
                result.classList.toggle('disabled', !this.checkDigits(digits, required));
                ++i;
            }
        }
    }
}
