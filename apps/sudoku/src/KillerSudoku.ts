import { Array2D, Array4D, $div, E, tryParseInt, Tuple10, $span, $input, $label } from './common';


export const KILLER_SUMS: Array4D<number> = [E,
    [E,[[1]],[[2]],[[3]],[[4]],[[5]],[[6]],[[7]],[[8]],[[9]],E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E],
    [E,E,E,[[1,2]],[[1,3]],[[1,4],[2,3]],[[1,5],[2,4]],[[1,6],[2,5],[3,4]],[[1,7],[2,6],[3,5]],[[1,8],[2,7],[3,6],[4,5]],[[1,9],[2,8],[3,7],[4,6]],[[2,9],[3,8],[4,7],[5,6]],[[3,9],[4,8],[5,7]],[[4,9],[5,8],[6,7]],[[5,9],[6,8]],[[6,9],[7,8]],[[7,9]],[[8,9]],E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E],
    [E,E,E,E,E,E,[[1,2,3]],[[1,2,4]],[[1,2,5],[1,3,4]],[[1,2,6],[1,3,5],[2,3,4]],[[1,2,7],[1,3,6],[1,4,5],[2,3,5]],[[1,2,8],[1,3,7],[1,4,6],[2,3,6],[2,4,5]],[[1,2,9],[1,3,8],[1,4,7],[1,5,6],[2,3,7],[2,4,6],[3,4,5]],[[1,3,9],[1,4,8],[1,5,7],[2,3,8],[2,4,7],[2,5,6],[3,4,6]],[[1,4,9],[1,5,8],[1,6,7],[2,3,9],[2,4,8],[2,5,7],[3,4,7],[3,5,6]],[[1,5,9],[1,6,8],[2,4,9],[2,5,8],[2,6,7],[3,4,8],[3,5,7],[4,5,6]],[[1,6,9],[1,7,8],[2,5,9],[2,6,8],[3,4,9],[3,5,8],[3,6,7],[4,5,7]],[[1,7,9],[2,6,9],[2,7,8],[3,5,9],[3,6,8],[4,5,8],[4,6,7]],[[1,8,9],[2,7,9],[3,6,9],[3,7,8],[4,5,9],[4,6,8],[5,6,7]],[[2,8,9],[3,7,9],[4,6,9],[4,7,8],[5,6,8]],[[3,8,9],[4,7,9],[5,6,9],[5,7,8]],[[4,8,9],[5,7,9],[6,7,8]],[[5,8,9],[6,7,9]],[[6,8,9]],[[7,8,9]],E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E],
    [E,E,E,E,E,E,E,E,E,E,[[1,2,3,4]],[[1,2,3,5]],[[1,2,3,6],[1,2,4,5]],[[1,2,3,7],[1,2,4,6],[1,3,4,5]],[[1,2,3,8],[1,2,4,7],[1,2,5,6],[1,3,4,6],[2,3,4,5]],[[1,2,3,9],[1,2,4,8],[1,2,5,7],[1,3,4,7],[1,3,5,6],[2,3,4,6]],[[1,2,4,9],[1,2,5,8],[1,2,6,7],[1,3,4,8],[1,3,5,7],[1,4,5,6],[2,3,4,7],[2,3,5,6]],[[1,2,5,9],[1,2,6,8],[1,3,4,9],[1,3,5,8],[1,3,6,7],[1,4,5,7],[2,3,4,8],[2,3,5,7],[2,4,5,6]],[[1,2,6,9],[1,2,7,8],[1,3,5,9],[1,3,6,8],[1,4,5,8],[1,4,6,7],[2,3,4,9],[2,3,5,8],[2,3,6,7],[2,4,5,7],[3,4,5,6]],[[1,2,7,9],[1,3,6,9],[1,3,7,8],[1,4,5,9],[1,4,6,8],[1,5,6,7],[2,3,5,9],[2,3,6,8],[2,4,5,8],[2,4,6,7],[3,4,5,7]],[[1,2,8,9],[1,3,7,9],[1,4,6,9],[1,4,7,8],[1,5,6,8],[2,3,6,9],[2,3,7,8],[2,4,5,9],[2,4,6,8],[2,5,6,7],[3,4,5,8],[3,4,6,7]],[[1,3,8,9],[1,4,7,9],[1,5,6,9],[1,5,7,8],[2,3,7,9],[2,4,6,9],[2,4,7,8],[2,5,6,8],[3,4,5,9],[3,4,6,8],[3,5,6,7]],[[1,4,8,9],[1,5,7,9],[1,6,7,8],[2,3,8,9],[2,4,7,9],[2,5,6,9],[2,5,7,8],[3,4,6,9],[3,4,7,8],[3,5,6,8],[4,5,6,7]],[[1,5,8,9],[1,6,7,9],[2,4,8,9],[2,5,7,9],[2,6,7,8],[3,4,7,9],[3,5,6,9],[3,5,7,8],[4,5,6,8]],[[1,6,8,9],[2,5,8,9],[2,6,7,9],[3,4,8,9],[3,5,7,9],[3,6,7,8],[4,5,6,9],[4,5,7,8]],[[1,7,8,9],[2,6,8,9],[3,5,8,9],[3,6,7,9],[4,5,7,9],[4,6,7,8]],[[2,7,8,9],[3,6,8,9],[4,5,8,9],[4,6,7,9],[5,6,7,8]],[[3,7,8,9],[4,6,8,9],[5,6,7,9]],[[4,7,8,9],[5,6,8,9]],[[5,7,8,9]],[[6,7,8,9]],E,E,E,E,E,E,E,E,E,E,E,E,E,E,E],
    [E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,[[1,2,3,4,5]],[[1,2,3,4,6]],[[1,2,3,4,7],[1,2,3,5,6]],[[1,2,3,4,8],[1,2,3,5,7],[1,2,4,5,6]],[[1,2,3,4,9],[1,2,3,5,8],[1,2,3,6,7],[1,2,4,5,7],[1,3,4,5,6]],[[1,2,3,5,9],[1,2,3,6,8],[1,2,4,5,8],[1,2,4,6,7],[1,3,4,5,7],[2,3,4,5,6]],[[1,2,3,6,9],[1,2,3,7,8],[1,2,4,5,9],[1,2,4,6,8],[1,2,5,6,7],[1,3,4,5,8],[1,3,4,6,7],[2,3,4,5,7]],[[1,2,3,7,9],[1,2,4,6,9],[1,2,4,7,8],[1,2,5,6,8],[1,3,4,5,9],[1,3,4,6,8],[1,3,5,6,7],[2,3,4,5,8],[2,3,4,6,7]],[[1,2,3,8,9],[1,2,4,7,9],[1,2,5,6,9],[1,2,5,7,8],[1,3,4,6,9],[1,3,4,7,8],[1,3,5,6,8],[1,4,5,6,7],[2,3,4,5,9],[2,3,4,6,8],[2,3,5,6,7]],[[1,2,4,8,9],[1,2,5,7,9],[1,2,6,7,8],[1,3,4,7,9],[1,3,5,6,9],[1,3,5,7,8],[1,4,5,6,8],[2,3,4,6,9],[2,3,4,7,8],[2,3,5,6,8],[2,4,5,6,7]],[[1,2,5,8,9],[1,2,6,7,9],[1,3,4,8,9],[1,3,5,7,9],[1,3,6,7,8],[1,4,5,6,9],[1,4,5,7,8],[2,3,4,7,9],[2,3,5,6,9],[2,3,5,7,8],[2,4,5,6,8],[3,4,5,6,7]],[[1,2,6,8,9],[1,3,5,8,9],[1,3,6,7,9],[1,4,5,7,9],[1,4,6,7,8],[2,3,4,8,9],[2,3,5,7,9],[2,3,6,7,8],[2,4,5,6,9],[2,4,5,7,8],[3,4,5,6,8]],[[1,2,7,8,9],[1,3,6,8,9],[1,4,5,8,9],[1,4,6,7,9],[1,5,6,7,8],[2,3,5,8,9],[2,3,6,7,9],[2,4,5,7,9],[2,4,6,7,8],[3,4,5,6,9],[3,4,5,7,8]],[[1,3,7,8,9],[1,4,6,8,9],[1,5,6,7,9],[2,3,6,8,9],[2,4,5,8,9],[2,4,6,7,9],[2,5,6,7,8],[3,4,5,7,9],[3,4,6,7,8]],[[1,4,7,8,9],[1,5,6,8,9],[2,3,7,8,9],[2,4,6,8,9],[2,5,6,7,9],[3,4,5,8,9],[3,4,6,7,9],[3,5,6,7,8]],[[1,5,7,8,9],[2,4,7,8,9],[2,5,6,8,9],[3,4,6,8,9],[3,5,6,7,9],[4,5,6,7,8]],[[1,6,7,8,9],[2,5,7,8,9],[3,4,7,8,9],[3,5,6,8,9],[4,5,6,7,9]],[[2,6,7,8,9],[3,5,7,8,9],[4,5,6,8,9]],[[3,6,7,8,9],[4,5,7,8,9]],[[4,6,7,8,9]],[[5,6,7,8,9]],E,E,E,E,E,E,E,E,E,E],
    [E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,[[1,2,3,4,5,6]],[[1,2,3,4,5,7]],[[1,2,3,4,5,8],[1,2,3,4,6,7]],[[1,2,3,4,5,9],[1,2,3,4,6,8],[1,2,3,5,6,7]],[[1,2,3,4,6,9],[1,2,3,4,7,8],[1,2,3,5,6,8],[1,2,4,5,6,7]],[[1,2,3,4,7,9],[1,2,3,5,6,9],[1,2,3,5,7,8],[1,2,4,5,6,8],[1,3,4,5,6,7]],[[1,2,3,4,8,9],[1,2,3,5,7,9],[1,2,3,6,7,8],[1,2,4,5,6,9],[1,2,4,5,7,8],[1,3,4,5,6,8],[2,3,4,5,6,7]],[[1,2,3,5,8,9],[1,2,3,6,7,9],[1,2,4,5,7,9],[1,2,4,6,7,8],[1,3,4,5,6,9],[1,3,4,5,7,8],[2,3,4,5,6,8]],[[1,2,3,6,8,9],[1,2,4,5,8,9],[1,2,4,6,7,9],[1,2,5,6,7,8],[1,3,4,5,7,9],[1,3,4,6,7,8],[2,3,4,5,6,9],[2,3,4,5,7,8]],[[1,2,3,7,8,9],[1,2,4,6,8,9],[1,2,5,6,7,9],[1,3,4,5,8,9],[1,3,4,6,7,9],[1,3,5,6,7,8],[2,3,4,5,7,9],[2,3,4,6,7,8]],[[1,2,4,7,8,9],[1,2,5,6,8,9],[1,3,4,6,8,9],[1,3,5,6,7,9],[1,4,5,6,7,8],[2,3,4,5,8,9],[2,3,4,6,7,9],[2,3,5,6,7,8]],[[1,2,5,7,8,9],[1,3,4,7,8,9],[1,3,5,6,8,9],[1,4,5,6,7,9],[2,3,4,6,8,9],[2,3,5,6,7,9],[2,4,5,6,7,8]],[[1,2,6,7,8,9],[1,3,5,7,8,9],[1,4,5,6,8,9],[2,3,4,7,8,9],[2,3,5,6,8,9],[2,4,5,6,7,9],[3,4,5,6,7,8]],[[1,3,6,7,8,9],[1,4,5,7,8,9],[2,3,5,7,8,9],[2,4,5,6,8,9],[3,4,5,6,7,9]],[[1,4,6,7,8,9],[2,3,6,7,8,9],[2,4,5,7,8,9],[3,4,5,6,8,9]],[[1,5,6,7,8,9],[2,4,6,7,8,9],[3,4,5,7,8,9]],[[2,5,6,7,8,9],[3,4,6,7,8,9]],[[3,5,6,7,8,9]],[[4,5,6,7,8,9]],E,E,E,E,E,E],
    [E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,[[1,2,3,4,5,6,7]],[[1,2,3,4,5,6,8]],[[1,2,3,4,5,6,9],[1,2,3,4,5,7,8]],[[1,2,3,4,5,7,9],[1,2,3,4,6,7,8]],[[1,2,3,4,5,8,9],[1,2,3,4,6,7,9],[1,2,3,5,6,7,8]],[[1,2,3,4,6,8,9],[1,2,3,5,6,7,9],[1,2,4,5,6,7,8]],[[1,2,3,4,7,8,9],[1,2,3,5,6,8,9],[1,2,4,5,6,7,9],[1,3,4,5,6,7,8]],[[1,2,3,5,7,8,9],[1,2,4,5,6,8,9],[1,3,4,5,6,7,9],[2,3,4,5,6,7,8]],[[1,2,3,6,7,8,9],[1,2,4,5,7,8,9],[1,3,4,5,6,8,9],[2,3,4,5,6,7,9]],[[1,2,4,6,7,8,9],[1,3,4,5,7,8,9],[2,3,4,5,6,8,9]],[[1,2,5,6,7,8,9],[1,3,4,6,7,8,9],[2,3,4,5,7,8,9]],[[1,3,5,6,7,8,9],[2,3,4,6,7,8,9]],[[1,4,5,6,7,8,9],[2,3,5,6,7,8,9]],[[2,4,5,6,7,8,9]],[[3,4,5,6,7,8,9]],E,E,E],
    [E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,[[1,2,3,4,5,6,7,8]],[[1,2,3,4,5,6,7,9]],[[1,2,3,4,5,6,8,9]],[[1,2,3,4,5,7,8,9]],[[1,2,3,4,6,7,8,9]],[[1,2,3,5,6,7,8,9]],[[1,2,4,5,6,7,8,9]],[[1,3,4,5,6,7,8,9]],[[2,3,4,5,6,7,8,9]],E],
    [E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,[[1,2,3,4,5,6,7,8,9]]]
];


export default class KillerSudoku {
    readonly digitFlags: Tuple10<number>;
    readonly resultDivs: Array2D<HTMLElement>;
    readonly container: HTMLElement;
    readonly sumInput: HTMLInputElement;
    readonly sizeInput: HTMLInputElement;

    sum: number;
    size: number;

    constructor(parent: HTMLElement) {
        this.sum = 20;
        this.size = 5;
        this.digitFlags = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.resultDivs = [[], [], []];
        this.container = $div();
        this.container.id = 'ma-sudoku-killer';
        parent.appendChild(this.container);
        this.sumInput = document.createElement('input');
        this.sizeInput = document.createElement('input');
        this.buildGUIHeader();
        this.buildGUI();
    }

    buildGUIHeader(): void {
        $div($div($div(this.container, 'header')), null, 'Killer Sudoku');
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
        this.sizeInput.type = 'text';
        this.sizeInput.minLength = 1;
        this.sizeInput.maxLength = 1;
        this.sizeInput.pattern = '[1-9]';
        this.sizeInput.value = '5';
        this.sizeInput.addEventListener('change', (): void => {
            const val: number = tryParseInt(this.sizeInput.value);
            if (val > 0 && val <= 9) {
                this.size = val;
                this.update();
            }
        });
        const inputArea: HTMLElement = $div($div(this.container, 'row'), 'input-area');
        let table: HTMLElement = $div(inputArea, 'table');
        $div($div(table, 'column caption'), null, 'Cage sum');
        $div(table, 'btn', '-').addEventListener('click', (): void => {
            if (this.sum > 1) {
                --this.sum;
                this.sumInput.value = String(this.sum);
                this.update();
            }
        });
        $div(table, 'textbox').appendChild(this.sumInput);
        $div(table, 'btn', '+').addEventListener('click', (): void => {
            if (this.sum < 45) {
                ++this.sum;
                this.sumInput.value = String(this.sum);
                this.update();
            }
        });
        const sizeCaption: HTMLElement = $div(table, 'column caption');
        sizeCaption.style.marginLeft = '0px';
        $div(sizeCaption, null, 'Cage size');
        $div(table, 'btn', '-').addEventListener('click', (): void => {
            if (this.size > 1) {
                --this.size;
                this.sizeInput.value = String(this.size);
                this.update();
            }
        });
        $div(table, 'textbox').appendChild(this.sizeInput);
        $div(table, 'btn', '+').addEventListener('click', (): void => {
            if (this.size < 9) {
                ++this.size;
                this.sizeInput.value = String(this.size);
                this.update();
            }
        });
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
                input.name = `ma-sudoku-killer-r${digit}`;
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
        const row: HTMLElement = $div(this.container, 'row');
        const results: Array<HTMLElement> = [
            $div(row, 'results'),
            $div(row, 'results'),
            $div(row, 'results')
        ];
        results[1].style.margin = '0 24px';
        for (let j: number = 0; j < 3; ++j) for (let i: number = 0; i < 4; ++i) {
            this.resultDivs[j].push($div(results[j]));
        }
        this.update();
    }

    checkDigits(digits: Array<number>, required: number): boolean {
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
        for (; i < 3; ++i) for (let j: number = 0; j < 4; ++j) {
            this.resultDivs[i][j].innerText = '';
        }
        if (this.sum < 1 || this.sum > 45 || this.size < 1 || this.size > 9) {
            return;
        }
        let required: number = 0;
        for (const flag of this.digitFlags) if (flag > 0) {
            ++required;
        }
        i = 0;
        for (const digits of KILLER_SUMS[this.size][this.sum]) {
            const result: HTMLElement = this.resultDivs[i % 3][Math.floor(i / 3)];
            result.innerText = digits.join(' ');
            result.classList.toggle('disabled', !this.checkDigits(digits, required));
            ++i;
        }
    }
}
