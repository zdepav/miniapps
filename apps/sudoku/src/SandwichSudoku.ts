import { Array3D, $div, E, tryParseInt, $span, $input, $label, Tuple8, Tuple9 } from '@/common';


const SANDWICH_SUMS: Array3D<number> = [
    E,E,[[2]],[[3]],[[4]],[[5],[2,3]],[[6],[2,4]],[[7],[3,4],[2,5]],[[8],[3,5],[2,6]],
    [[4,5],[3,6],[2,7],[2,3,4]],[[4,6],[3,7],[2,8],[2,3,5]],[[5,6],[4,7],[3,8],[2,4,5],[2,3,6]],
    [[5,7],[4,8],[3,4,5],[2,4,6],[2,3,7]],[[6,7],[5,8],[3,4,6],[2,5,6],[2,4,7],[2,3,8]],
    [[6,8],[3,5,6],[3,4,7],[2,5,7],[2,4,8],[2,3,4,5]],
    [[7,8],[4,5,6],[3,5,7],[3,4,8],[2,6,7],[2,5,8],[2,3,4,6]],
    [[4,5,7],[3,6,7],[3,5,8],[2,6,8],[2,3,5,6],[2,3,4,7]],
    [[4,6,7],[4,5,8],[3,6,8],[2,7,8],[2,4,5,6],[2,3,5,7],[2,3,4,8]],
    [[5,6,7],[4,6,8],[3,7,8],[3,4,5,6],[2,4,5,7],[2,3,6,7],[2,3,5,8]],
    [[5,6,8],[4,7,8],[3,4,5,7],[2,4,6,7],[2,4,5,8],[2,3,6,8]],
    [[5,7,8],[3,4,6,7],[3,4,5,8],[2,5,6,7],[2,4,6,8],[2,3,7,8],[2,3,4,5,6]],
    [[6,7,8],[3,5,6,7],[3,4,6,8],[2,5,6,8],[2,4,7,8],[2,3,4,5,7]],
    [[4,5,6,7],[3,5,6,8],[3,4,7,8],[2,5,7,8],[2,3,4,6,7],[2,3,4,5,8]],
    [[4,5,6,8],[3,5,7,8],[2,6,7,8],[2,3,5,6,7],[2,3,4,6,8]],
    [[4,5,7,8],[3,6,7,8],[2,4,5,6,7],[2,3,5,6,8],[2,3,4,7,8]],
    [[4,6,7,8],[3,4,5,6,7],[2,4,5,6,8],[2,3,5,7,8]],
    [[5,6,7,8],[3,4,5,6,8],[2,4,5,7,8],[2,3,6,7,8]],[[3,4,5,7,8],[2,4,6,7,8],[2,3,4,5,6,7]],
    [[3,4,6,7,8],[2,5,6,7,8],[2,3,4,5,6,8]],[[3,5,6,7,8],[2,3,4,5,7,8]],
    [[4,5,6,7,8],[2,3,4,6,7,8]],[[2,3,5,6,7,8]],[[2,4,5,6,7,8]],[[3,4,5,6,7,8]],E,[[2,3,4,5,6,7,8]]
]

export default class SandwichSudoku {
    readonly counts: Tuple8<boolean>;
    readonly digitFlags: Tuple9<number>;
    readonly resultDivs: Array<HTMLElement>;
    readonly container: HTMLElement;
    readonly sumInput: HTMLInputElement;

    sum: number

    constructor(parent: HTMLElement) {
        this.counts = [false, true, true, true, true, true, true, true];
        this.digitFlags = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.resultDivs = [];
        this.sum = 20;
        this.container = $div(parent);
        this.container.id = 'ma-sudoku-sandwich';
        this.sumInput = document.createElement('input');
        this.buildGUIHeader();
        this.buildGUI();
    }

    buildGUIHeader(): void {
        $div($div(this.container, 'header'), null, 'Sandwich Sudoku');
    }

    buildGUI(): void {
        this.sumInput.type = 'text';
        this.sumInput.minLength = 1;
        this.sumInput.maxLength = 2;
        this.sumInput.pattern = '[2-9]|[12][0-9]|3[0-35]';
        this.sumInput.value = '20';
        this.sumInput.addEventListener('change', (): void => {
            const val: number = tryParseInt(this.sumInput.value);
            if (val >= 0 && val < 36) {
                this.sum = val;
                this.update();
            }
        });
        const mainRow: HTMLElement = $div(this.container, 'row');
        const inputArea: HTMLElement = $div(mainRow, 'input-area');
        let table: HTMLElement = $div(inputArea, 'table');
        $div($div(table, 'column caption'), null, 'Sandwich sum');
        $div(table, 'btn', '-').addEventListener('click', (): void => {
            if (this.sum > 0) {
                --this.sum;
                this.sumInput.value = String(this.sum);
                this.update();
            }
        });
        $div(table, 'textbox').append(this.sumInput);
        $div(table, 'btn', '+').addEventListener('click', (): void => {
            if (this.sum < 35) {
                ++this.sum;
                this.sumInput.value = String(this.sum);
                this.update();
            }
        });
        table = $div(inputArea, 'table');
        $div($div(table, 'column caption'), null, 'Sandwich size');
        for (let count: number = 1; count < 8; ++count) {
            const column: HTMLElement = $div(table, 'column');
            const label: HTMLLabelElement = $label(column);
            const input: HTMLInputElement = $input(label);
            input.type = 'checkbox';
            input.name = `ma-sudoku-sandwich-c${count}`;
            input.checked = true;
            input.addEventListener('change', (): void => {
                this.counts[count] = input.checked;
                this.update();
            });
            $span(label, null, String(count));
        }
        table = $div(inputArea, 'table');
        const captionGroup: HTMLElement = $div(table, 'column caption');
        $div(captionGroup, null, 'Must include');
        $div(captionGroup, null, 'Can include');
        $div(captionGroup, null, 'Can\'t include');
        for (let digit: number = 2; digit < 9; ++digit) {
            const column: HTMLElement = $div(table, 'column');
            for (let flag: number = 1; flag > -2; --flag) {
                const label: HTMLLabelElement = $label(column);
                const input: HTMLInputElement = $input(label);
                input.type = 'radio';
                input.name = `ma-sudoku-sandwich-r${digit}`;
                input.checked = flag === 0;
                input.addEventListener('change', (): void => {
                    if (input.checked) {
                        this.digitFlags[digit] = flag;
                        this.update();
                    }
                });
                $span(label, null, String(digit));
            }
        }
        const results: HTMLElement = $div(mainRow, 'results');
        for (let i: number = 0; i < 7; ++i) {
            this.resultDivs.push($div(results));
        }
        this.update();
    }

    checkDigits(digits: Array<number>, required: number): boolean {
        if (!this.counts[digits.length]) {
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
        for (const rdiv of this.resultDivs) {
            rdiv.innerText = '';
        }
        if (this.sum < 0 || this.sum > 35) {
            return;
        }
        let required: number = 0;
        for (const flag of this.digitFlags) if (flag > 0) {
            ++required;
        }
        let i: number = 0;
        for (const digits of SANDWICH_SUMS[this.sum]) {
            this.resultDivs[i].innerText = digits.join(' ');
            this.resultDivs[i].classList.toggle('disabled', !this.checkDigits(digits, required));
            ++i;
        }
    }
}
