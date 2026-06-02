import { Formula } from '@/Formula';
import {
    DEBUG,
    getErrorMessage,
    MATH_ML_XMLNS,
    MAX_BOUND_ALLOWED,
    MIN_BOUND_ALLOWED,
    SVG_XMLNS
} from '@/utils';

function setInputValidity(element: HTMLInputElement, error: string = ''): void {
    element.title = error;
    element.setCustomValidity(error);
}

export class UI {
    private readonly previewElement: MathMLElement;
    private readonly chartElement: SVGSVGElement;
    private readonly inputElements: HTMLInputElement[];
    private readonly formulaInputElement: HTMLInputElement;
    private readonly data: {
        xmin: number;
        xmax: number;
        ymin: number;
        ymax: number;
    };
    private formula: Formula;
    private readonly lightTheme: () => boolean;

    private tryUpdateData(
        inputElement: HTMLInputElement,
        id: keyof typeof this.data,
        storageId: string
    ): void {
        if (inputElement.validity.patternMismatch) {
            setInputValidity(inputElement, 'Not a number');
            return;
        }
        const valStr: string = inputElement.value;
        let valNum: number;
        try {
            valNum = parseFloat(valStr);
        } catch (error) {
            setInputValidity(inputElement, getErrorMessage(error));
            return;
        }
        if (isNaN(valNum) || valNum < MIN_BOUND_ALLOWED || valNum > MAX_BOUND_ALLOWED) {
            setInputValidity(inputElement, 'Invalid value');
            return;
        }
        this.data[id] = valNum;
        localStorage.setItem(storageId, valStr);
        setInputValidity(inputElement);
    }

    private createLabeledInput(label: string, id: keyof typeof this.data): HTMLLabelElement {
        const storageId: string = `miniapps.ChartPlotter.${id}`;
        let value: string | null = localStorage.getItem(storageId);
        if (value != null) {
            this.data[id] = parseFloat(value);
        } else {
            value = String(this.data[id]);
        }
        const element: HTMLLabelElement = document.createElement('label');
        element.classList.add('number');
        const spanElement: HTMLSpanElement = document.createElement('span');
        spanElement.innerText = label + ':';
        element.appendChild(spanElement);
        const inputElement: HTMLInputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.value = value;
        inputElement.pattern = '[\\-+]?[0-9]+(\\.[0-9]+)?';
        inputElement.addEventListener('input', (): void => {
            this.tryUpdateData(inputElement, id, storageId);
        });
        element.appendChild(inputElement);
        this.inputElements.push(inputElement);
        return element;
    }

    private createBoundsInputs(container: HTMLElement): void {
        const boundsRowElement: HTMLDivElement = document.createElement('div');
        boundsRowElement.classList.add('chart-form-row');
        const xVarElement: HTMLDivElement = document.createElement('div');
        xVarElement.classList.add('chart-var');
        xVarElement.setAttribute('data-var', 'X');
        xVarElement.appendChild(this.createLabeledInput('Min', 'xmin'));
        xVarElement.appendChild(this.createLabeledInput('Max', 'xmax'));
        boundsRowElement.appendChild(xVarElement);
        const yVarElement: HTMLDivElement = document.createElement('div');
        yVarElement.classList.add('chart-var');
        yVarElement.setAttribute('data-var', 'Y');
        yVarElement.appendChild(this.createLabeledInput('Min', 'ymin'));
        yVarElement.appendChild(this.createLabeledInput('Max', 'ymax'));
        boundsRowElement.appendChild(yVarElement);
        container.appendChild(boundsRowElement);
    }

    private tryUpdateFormula(inputElement: HTMLInputElement): void {
        const value: string = inputElement.value;
        try {
            this.formula = new Formula(value);
        } catch (error) {
            setInputValidity(inputElement, getErrorMessage(error));
            return;
        }
        setInputValidity(inputElement);
        localStorage.setItem('miniapps.ChartPlotter.formula', value);
        this.formula.display(this.previewElement);
    }

    private createFormulaInput(container: HTMLElement): HTMLInputElement {
        let value: string | null = localStorage.getItem('miniapps.ChartPlotter.formula');
        if (value != null) {
            this.formula = new Formula(value);
        } else {
            value = '100*√(|(sin-x*cos(x/2.))/sqrt(1+|x|)|^2÷(4+3*x+.5*x^2+2×x^3/7+x^4))';
        }
        const formulaRowElement: HTMLDivElement = document.createElement('div');
        formulaRowElement.classList.add('chart-form-row');
        const formulaVarElement: HTMLDivElement = document.createElement('div');
        formulaVarElement.classList.add('chart-var');
        formulaVarElement.classList.add('stretch');
        formulaVarElement.setAttribute('data-var', 'Formula');
        const labelElement: HTMLLabelElement = document.createElement('label');
        labelElement.classList.add('text');
        const inputElement: HTMLInputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.value = value;
        inputElement.addEventListener('input', (): void => {
            this.tryUpdateFormula(inputElement);
        });
        inputElement.addEventListener('keydown', (event: KeyboardEvent): void => {
            if (event.ctrlKey && event.key === 'Enter') {
                this.tryBuildChart();
            }
        });
        labelElement.appendChild(inputElement);
        this.inputElements.push(inputElement);
        formulaVarElement.appendChild(labelElement);
        formulaRowElement.appendChild(formulaVarElement);
        container.appendChild(formulaRowElement);
        return inputElement;
    }

    private tryBuildChart(): void {
        for (const inputElement of this.inputElements) {
            if (!inputElement.validity.valid) {
                return;
            }
        }
        this.formula.buildChart(
            this.chartElement,
            this.data.xmin,
            this.data.xmax,
            this.data.ymin,
            this.data.ymax,
            this.lightTheme()
        );
    }

    private createButtons(container: HTMLElement): void {
        const buttonsRowElement: HTMLDivElement = document.createElement('div');
        buttonsRowElement.classList.add('chart-form-row');
        const chartButtonElement: HTMLButtonElement = document.createElement('button');
        chartButtonElement.classList.add('chart-btn');
        chartButtonElement.innerText = 'Generate Chart';
        chartButtonElement.addEventListener('click', (): void => this.tryBuildChart());
        buttonsRowElement.appendChild(chartButtonElement);
        if (DEBUG) {
            const debugButtonElement: HTMLButtonElement = document.createElement('button');
            debugButtonElement.classList.add('chart-btn');
            debugButtonElement.classList.add('debug');
            debugButtonElement.innerText = 'Parse Formula';
            debugButtonElement.addEventListener('click', (): void => {
                Formula.debugFormula(this.formulaInputElement.value);
            });
            buttonsRowElement.appendChild(debugButtonElement);
        }
        container.appendChild(buttonsRowElement);
    }

    private createChartContainer(container: HTMLElement): void {
        const chartAreaElement: HTMLDivElement = document.createElement('div');
        chartAreaElement.classList.add('chart-area');
        chartAreaElement.appendChild(this.chartElement);
        container.appendChild(chartAreaElement);
    }

    constructor(container: HTMLElement) {
        this.data = { xmin: -10, xmax: 10, ymin: 0, ymax: 36 };
        this.formula = new Formula(
            '100*√(|(sin-x*cos(x/2.))/sqrt(1+|x|)|^2÷(4+3*x+.5*x^2+2×x^3/7+x^4))'
        );
        this.inputElements = [];
        this.previewElement = <MathMLElement>document.createElementNS(MATH_ML_XMLNS, 'math');
        this.chartElement = <SVGSVGElement>document.createElementNS(SVG_XMLNS, 'svg');
        this.createBoundsInputs(container);
        this.formulaInputElement = this.createFormulaInput(container);
        container.appendChild(this.previewElement);
        this.createButtons(container);
        this.createChartContainer(container);
        this.formula.display(this.previewElement);
        this.lightTheme = (): boolean => container.getAttribute('data-theme') === 'light';
    }
}

// heart:
//   formula: 1.2*max(min(10*sin(20*x),2*sqrt|sin x|),((|x|-2)^3+2*|x|)/3-3)*max(0,min(1,1000*(pi-|x|)))
//   x: -5 .. 5
//   y: -7 .. 3
