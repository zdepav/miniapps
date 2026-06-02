import FormulaNode from '@/nodes/FormulaNode';

/** Numeric constant */
export default class NumberNode extends FormulaNode {
    readonly value: number;

    /** Constant name (if any) */
    readonly name: string | null;

    /** @inheritdoc */
    override get isComplex(): boolean {
        return false;
    }

    constructor(value: number, name?: string) {
        super();
        this.value = value;
        this.name = name ?? null;
    }

    /** @inheritdoc */
    override toMathML(): MathMLElement {
        if (this.name != null) { // named constant
            return this.textElement('mi', this.name);
        }
        return this.textElement('mn', this.value);
    }

    /** @inheritdoc */
    override eval(_x: number): number {
        return this.value;
    }

    /** @inheritdoc */
    override toString(): string {
        if (this.name != null) {
            return `NumberNode(${this.value}, "${this.name}")`;
        }
        return `num(${this.value})`;
    }

    static readonly E: NumberNode = new NumberNode(Math.E, 'e');
    static readonly PI: NumberNode = new NumberNode(Math.PI, '\u03c0');
}