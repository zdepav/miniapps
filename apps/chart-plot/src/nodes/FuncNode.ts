import FormulaNode from '@/nodes/FormulaNode';

export enum MathFuncCategory {
    NONE = 0,
    COMPARING,
    LOGARITHMIC,
    TRIGONOMETRIC
}

export class MathFunc {

    private static NAME_MAP: Map<string, MathFunc> = new Map();

    readonly name: string;
    readonly allNames: string;
    readonly impl: Function;
    readonly category: MathFuncCategory;
    readonly argCount: number;

    private constructor(
        category: MathFuncCategory,
        func: Function,
        ...names: string[]
    ) {
        for (const name of names) {
            MathFunc.NAME_MAP.set(name, this);
        }
        this.category = category;
        this.argCount = func.length;
        this.impl = func;
        this.name = names[0];
        this.allNames = names[0];
        if (names.length > 1) {
            names.shift();
            this.allNames = `${this.name} (${names.join(', ')})`;
        }
    }

    static ABS: MathFunc = new MathFunc(MathFuncCategory.NONE, Math.abs, 'abs');
    static SQRT: MathFunc = new MathFunc(MathFuncCategory.NONE, Math.sqrt, 'sqrt');
    static TRUNC: MathFunc = new MathFunc(MathFuncCategory.NONE, Math.trunc, 'trunc');
    static FLOOR: MathFunc = new MathFunc(MathFuncCategory.NONE, Math.floor, 'floor');
    static ROUND: MathFunc = new MathFunc(MathFuncCategory.NONE, Math.round, 'round');
    static CEIL: MathFunc = new MathFunc(MathFuncCategory.NONE, Math.ceil, 'ceil', 'ceiling');
    static CLAMP: MathFunc = new MathFunc(
        MathFuncCategory.NONE,
        (x: number): number => x <= 0 ? 0 : x >= 1 ? 1 : x,
        'saturate', 'sat', 'clamp01', 'clip01'
    );
    static CLAMP2: MathFunc = new MathFunc(
        MathFuncCategory.NONE,
        (x: number, a: number, b: number): number => x <= a ? a : x >= b ? b : x,
        'clamp', 'clip'
    );
    static LERP: MathFunc = new MathFunc(
        MathFuncCategory.NONE,
        (x: number, a: number, b: number): number => a + (b - a) * x,
        'lerp'
    );
    static MIN: MathFunc = new MathFunc(
        MathFuncCategory.COMPARING,
        (a: number, b: number): number => a < b ? a : b,
        'min'
    );
    static MAX: MathFunc = new MathFunc(
        MathFuncCategory.COMPARING,
        (a: number, b: number): number => a > b ? a : b,
        'max'
    );

    static LOG: MathFunc = new MathFunc(
        MathFuncCategory.LOGARITHMIC, Math.log, 'ln', 'log', 'loge', 'log_e'
    );
    static LOG2: MathFunc = new MathFunc(MathFuncCategory.LOGARITHMIC, Math.log2, 'log2', 'log_2');
    static LOG10: MathFunc = new MathFunc(
        MathFuncCategory.LOGARITHMIC, Math.log10, 'log10', 'log_10'
    );
    static LOGN: MathFunc = new MathFunc(
        MathFuncCategory.LOGARITHMIC,
        (x: number, n: number): number => Math.log(x) / Math.log(n),
        'logn', 'log_n'
    );

    static DEG: MathFunc = new MathFunc(
        MathFuncCategory.TRIGONOMETRIC,
        (x: number): number => x * Math.PI / 180,
        'deg2rad', 'degtorad', 'd2r'
    );
    static SIN: MathFunc = new MathFunc(MathFuncCategory.TRIGONOMETRIC, Math.sin, 'sin');
    static COS: MathFunc = new MathFunc(MathFuncCategory.TRIGONOMETRIC, Math.cos, 'cos');
    static TAN: MathFunc = new MathFunc(MathFuncCategory.TRIGONOMETRIC, Math.tan, 'tan');
    static COT: MathFunc = new MathFunc(
        MathFuncCategory.TRIGONOMETRIC,
        (x: number): number => 1 / Math.tan(x),
        'cot'
    );
    static ASIN: MathFunc = new MathFunc(
        MathFuncCategory.TRIGONOMETRIC, Math.asin, 'arcsin', 'asin'
    );
    static ACOS: MathFunc = new MathFunc(
        MathFuncCategory.TRIGONOMETRIC, Math.acos, 'arccos', 'acos'
    );
    static ATAN: MathFunc = new MathFunc(
        MathFuncCategory.TRIGONOMETRIC, Math.atan, 'arctan', 'atan'
    );
    static ACOT: MathFunc = new MathFunc(
        MathFuncCategory.TRIGONOMETRIC,
        (x: number): number => Math.PI * 0.5 - Math.atan(1 / x),
        'arccot', 'acot'
    );

    static tryGetByName(name: string): MathFunc | undefined {
        return MathFunc.NAME_MAP.get(name);
    }
}

/** Function of one or more input values */
export default class FuncNode extends FormulaNode {

    func: MathFunc;
    args: FormulaNode[];

    /** @inheritdoc */
    override get isComplex(): boolean {
        return this.func != MathFunc.ABS && this.func != MathFunc.SQRT;
    }

    constructor(func: MathFunc, args: FormulaNode[]) {
        super();
        this.func = func;
        if (args.length != func.argCount) {
            throw new Error(`Function ${func.name} expects ${func.argCount} arguments`);
        }
        this.args = args;
    }

    private logToMathML(): MathMLElement {
        let sub: MathMLElement;
        if (this.func == MathFunc.LOG) {
            sub = this.textElement('mi', 'e');
        } else if (this.func == MathFunc.LOG2) {
            sub = this.textElement('mn', '2');
        } else if (this.func == MathFunc.LOG10) {
            sub = this.textElement('mn', '10');
        } else { // log_n
            sub = this.args[1].toMathMLGroup();
        }
        return this.tupleElement(
            'mrow',
            this.tupleElement('sub', this.textElement('mi', 'log'), this.textElement('mn', sub)),
            this.args[0].toMathMLGroup()
        );
    }

    private genericToMathML(funcName: string): MathMLElement {
        const elem: MathMLElement = this.element('mrow');
        elem.appendChild(this.textElement('mi', funcName));
        if (this.args.length == 1) {
            elem.appendChild(this.args[0].toMathMLGroup());
            return elem;
        }
        elem.appendChild(this.textElement('mo', '('));
        for (let i: number = 0; i < this.args.length; ++i) {
            if (i > 0) {
                elem.appendChild(this.textElement('mo', ','));
            }
            elem.appendChild(this.args[i].toMathML());
        }
        elem.appendChild(this.textElement('mo', ')'));
        return elem;
    }

    /** @inheritdoc */
    override toMathML(): MathMLElement {
        if (this.func.category == MathFuncCategory.LOGARITHMIC) {
            return this.logToMathML();
        } else if (this.func == MathFunc.SQRT) {
            return this.tupleElement('msqrt', this.args[0]);
        } else if (this.func == MathFunc.ABS) {
            return this.tupleElement('mrow', '|', this.args[0], '|');
        }
        return this.genericToMathML(this.func.name);
    }

    /** @inheritdoc */
    override eval(x: number): number {
        if (this.func.argCount === 3) {
            return this.func.impl(this.args[0].eval(x), this.args[1].eval(x), this.args[2].eval(x));
        } else if (this.func.argCount === 2) {
            return this.func.impl(this.args[0].eval(x), this.args[1].eval(x));
        } else {
            return this.func.impl(this.args[0].eval(x));
        }
    }

    /** @inheritdoc */
    override toString(): string {
        const args: string[] = this.args.map((a: FormulaNode): string => String(a));
        return `fn:${this.func.name}(${args.join(', ')})`;
    }
}
