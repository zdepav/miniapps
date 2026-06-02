import FormulaNode from '@/nodes/FormulaNode';

/** Binary operator type */
export enum Operator {
    ADD = 0,
    SUB,
    MUL,
    DIV,
    MOD,
    POW
}

/** Binary operator */
export default class OpNode extends FormulaNode {
    readonly left: FormulaNode;
    readonly op: Operator;
    readonly right: FormulaNode;

    /** @inheritdoc */
    override get isComplex(): boolean { return true; }

    get precedence(): number {
        if (this.op == Operator.ADD || this.op == Operator.SUB) {
            return 1;
        } else if (this.op == Operator.MUL || this.op == Operator.DIV) {
            return 2;
        } else if (this.op == Operator.POW) {
            return 3;
        } else { // MOD
            return 0;
        }
    }

    constructor(left: FormulaNode, op: Operator, right: FormulaNode) {
        super();
        this.left = left;
        this.op = op;
        this.right = right;
    }

    /** @inheritdoc */
    override toMathML(): MathMLElement {
        const prec: number = this.precedence;
        const left: MathMLElement = (
            this.op == Operator.POW || (this.left instanceof OpNode && prec > this.left.precedence)
        ) ? this.left.toMathMLGroup() : this.left.toMathML();
        const right: MathMLElement = (
            (this.right instanceof OpNode && prec >= this.right.precedence)
        ) ? this.right.toMathMLGroup() : this.right.toMathML();

        if (this.op == Operator.ADD) {
            return this.tupleElement('mrow', left, '+', right);
        } else if (this.op == Operator.SUB) {
            return this.tupleElement('mrow', left, '-', right);
        } else if (this.op == Operator.MUL) {
            if (this.left.isComplex/* || this.right.isComplex*/) {
                return this.tupleElement('mrow', left, '\u22C5', right);
            }
            return this.tupleElement('mrow', left, right);
        } else if (this.op == Operator.MOD) {
            return this.tupleElement('mrow', left, 'mod', right);
        } else if (this.op == Operator.POW) {
            return this.tupleElement('msup', left, right);
        } else { // DIV
            return this.tupleElement('mfrac', this.left, this.right);
        }
    }

    /** @inheritdoc */
    override eval(x: number): number {
        if (this.op == Operator.ADD) {
            return this.left.eval(x) + this.right.eval(x);
        } else if (this.op == Operator.SUB) {
            return this.left.eval(x) - this.right.eval(x);
        } else if (this.op == Operator.MUL) {
            return this.left.eval(x) * this.right.eval(x);
        } else if (this.op == Operator.MOD) {
            return this.left.eval(x) % this.right.eval(x);
        } else if (this.op == Operator.POW) {
            return Math.pow(this.left.eval(x), this.right.eval(x));
        } else { // DIV
            return this.left.eval(x) / this.right.eval(x);
        }
    }

    /** @inheritdoc */
    override toString(): string {
        return `op:${Operator[this.op].toLowerCase()}(${this.left}, ${this.right})`;
    }
}
