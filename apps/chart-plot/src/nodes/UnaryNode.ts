import FormulaNode from '@/nodes/FormulaNode';

/** Unary operator type */
export enum UnaryOperator {
    NEG = 0,
    PERCENT,
    PERMILLE,
    DEGREE,
    MINUTE,
    SECOND
}

/** Unary operator */
export default class UnaryNode extends FormulaNode {
    readonly operand: FormulaNode;
    readonly op: UnaryOperator;

    /** @inheritdoc */
    override get isComplex(): boolean { return true; }

    constructor(op: UnaryOperator, operand: FormulaNode) {
        super();
        this.op = op;
        this.operand = operand;
    }

    /** @inheritdoc */
    override toMathML(): MathMLElement {
        if (this.op == UnaryOperator.NEG) {
            return this.tupleElement('mrow', '-', this.operand);
        } else if (this.op == UnaryOperator.PERCENT) {
            return this.tupleElement('mrow', this.operand, '%');
        } else if (this.op == UnaryOperator.PERMILLE) {
            return this.tupleElement('mrow', this.operand, '\u2030');
        } else if (this.op == UnaryOperator.DEGREE) {
            return this.tupleElement('mrow', this.operand, '\xb0');
        } else if (this.op == UnaryOperator.MINUTE) {
            return this.tupleElement('mrow', this.operand, '\'');
        } else { // SECOND
            return this.tupleElement('mrow', this.operand, '"');
        }
    }

    /** @inheritdoc */
    override eval(x: number): number {
        if (this.op == UnaryOperator.NEG) {
            return -this.operand.eval(x);
        } else if (this.op == UnaryOperator.PERCENT) {
            return this.operand.eval(x) * 0.01;
        } else if (this.op == UnaryOperator.PERMILLE) {
            return this.operand.eval(x) * 0.001;
        } else if (this.op == UnaryOperator.DEGREE) {
            return this.operand.eval(x) * Math.PI / 180;
        } else if (this.op == UnaryOperator.MINUTE) {
            return this.operand.eval(x) * Math.PI / 10800;
        } else { // SECOND
            return this.operand.eval(x) * Math.PI / 648000;
        }
    }

    /** @inheritdoc */
    override toString(): string {
        return `op:${UnaryOperator[this.op].toLowerCase()}(${this.operand})`;
    }
}
