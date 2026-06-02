import { MATH_ML_XMLNS } from '@/utils';

/** Formula syntax tree node */
export default abstract class FormulaNode {

    /** Create empty MathML element
     * @param tag element type, e.g. mo
     * @returns created element
     */
    protected element(tag: string): MathMLElement {
        return <MathMLElement>document.createElementNS(MATH_ML_XMLNS, tag);
    }

    /** Create MathML element with text content
     * @param tag element type, e.g. mo
     * @param text element content, will be converted to string
     * @returns created element
     */
    protected textElement(tag: string, text: any): MathMLElement {
        const elem: MathMLElement = this.element(tag);
        elem.appendChild(document.createTextNode(String(text)));
        return elem;
    }

    /** Create MathML element with complex content
     * @param tag element type, e.g. mrow
     * @param contents sequence of child elements, strings will be interpreted as operators
     * @returns created element
     */
    protected tupleElement(
        tag: string,
        ...contents: (MathMLElement | string | FormulaNode)[]
    ): MathMLElement {
        const elem: MathMLElement = this.element(tag);
        for (const child of contents) {
            if (typeof child == 'string') {
                elem.appendChild(this.textElement('mo', child));
            } else if (child instanceof FormulaNode) {
                elem.appendChild(child.toMathML());
            } else {
                elem.appendChild(child);
            }
        }
        return elem;
    }

    /** If true, must be enclosed in parentheses when used as function argument */
    abstract get isComplex(): boolean;

    /** Recursively generate MathML for this node
     * @returns created element
     */
    abstract toMathML(): MathMLElement;

    /** Recursively generate MathML for this node and enclose it in parentheses if needed
     * @returns created element
     */
    toMathMLGroup(): MathMLElement {
        const elem: MathMLElement = this.toMathML();
        return this.isComplex ? this.tupleElement('mrow', '(', elem, ')') : elem;
    }

    /** Calculate Y for given X
     * @param x input variable
     * @returns computed result
     * @throws {Error} if value for `x` doesn't exist
     */
    abstract eval(x: number): number;
}

