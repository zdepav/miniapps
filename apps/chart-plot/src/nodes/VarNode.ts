import FormulaNode from '@/nodes/FormulaNode';

/** Input (x) variable */
export default class VarNode extends FormulaNode {

    /** @inheritdoc */
    override get isComplex(): boolean {
        return false;
    }

    private constructor() {
        super();
    }

    /** @inheritdoc */
    override toMathML(): MathMLElement {
        return this.textElement('mi', 'x');
    }

    /** @inheritdoc */
    override eval(x: number): number {
        return x;
    }

    /** @inheritdoc */
    override toString(): string {
        return 'var:x()';
    }

    static readonly X: VarNode = new VarNode();
}