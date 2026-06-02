import { getErrorMessage, SVG_XMLNS } from '@/utils';
import FormulaNode from '@/nodes/FormulaNode';
import FormulaParser from '@/FormulaParser';
import FormulaTokenizer from '@/FormulaTokenizer';

function axis(coordMin: number, coordMax: number, min: number, max: number): number | null {
    // the following is guaranteed by the caller: valueMin < valueMax, min <= max
    if (max < 0) {
        return null;
    } else if (max == 0) {
        return coordMax;
    } else if (min > 0) {
        return null;
    } else if (min == 0) {
        return coordMin;
    } else {
        return coordMin + min / (min - max) * (coordMax - coordMin);
    }
}

function pt(
    coordMin: number,
    coordMax: number,
    min: number,
    max: number,
    pos: number
): number {
    // valueMin is guaranteed to be less than valueMax
    return coordMin + (pos - min) / (max - min) * (coordMax - coordMin);
}

export class Formula {

    private readonly root: FormulaNode;

    constructor(source: string | FormulaNode) {
        if (typeof source == 'string') {
            this.root = new FormulaParser(source).parse();
        } else {
            this.root = source;
        }
    }

    /** Generate and display MathML element for this formula
     * @param mathElement container whose contents will be replaced with this formula
     */
    display(mathElement: MathMLElement): void {
        mathElement.innerHTML = '';
        mathElement.appendChild(this.root.toMathML());
    }

    /** Calculate Y for given X
     * @param x input variable
     * @returns computed result or NaN if value for `x` doesn't exist
     */
    eval(x: number): number {
        return this.root.eval(x);
    }

    /** Generate chart
     * @param image container whose contents will be replaced with the generated chart
     * @param xmin lower x bound
     * @param xmax upper x bound
     * @param ymin lower y bound
     * @param ymax upper y bound
     * @param lightTheme whether to use light theme colors
     */
    buildChart(
        image: SVGSVGElement,
        xmin: number, xmax: number,
        ymin: number, ymax: number,
        lightTheme: boolean
    ): void {
        if (xmax < xmin) {
            const buf: number = xmin;
            xmin = xmax;
            xmax = buf;
        }
        if (ymax < ymin) {
            const buf: number = ymin;
            ymin = ymax;
            ymax = buf;
        }
        image.innerHTML = '';
        image.viewBox.baseVal.x = -1;
        image.viewBox.baseVal.y = -1;
        image.viewBox.baseVal.width = 802;
        image.viewBox.baseVal.height = 602;
        let path: SVGPathElement = <SVGPathElement>document.createElementNS(SVG_XMLNS, 'path');
        path.style.fill = 'none';
        path.style.stroke = lightTheme ? '#26b' : '#48c';
        path.style.strokeWidth = '3';
        const xAxis: number | null = axis(0, 800, xmin, xmax);
        const yAxis: number | null = axis(600, 0, ymin, ymax);
        let axisPath: string = '';
        if (xAxis != null) {
            axisPath = `M${xAxis},0V600`;
        }
        if (yAxis != null) {
            axisPath += `M0,${yAxis}H800`;
        }
        path.setAttribute('d', axisPath);
        image.appendChild(path);

        function indicesImpl(
            points: Array<number>,
            min: number,
            max: number,
            steps: number
        ): Array<number> {
            let step: number = (max - min) / steps;
            if (min < 0 && max > 0) {
                const neg: number = Math.round(-min / step);
                indicesImpl(points, min, 0, neg);
                points.pop();
                indicesImpl(points, 0, max, steps - neg);
            } else if (max == 0) {
                for (let i: number = -steps; i <= 0; ++i) {
                    points.push(i * step);
                }
            } else {
                for (let i: number = 0; i <= steps; ++i) {
                    points.push(min + i * step);
                }
            }
            return points;
        }

        function indices(min: number, max: number): Array<number> {
            const points: Array<number> = [];
            indicesImpl(points, min, max, 800);
            return points;
        }

        const xs: Array<number> = indices(xmin, xmax);
        const ys: Array<number> = xs.map(
            (x: number): number => Math.min(
                Math.max(pt(600, 0, ymin, ymax, this.eval(x)), -10),
                610
            )
        );
        const pd: string[] = [`M0,${ys[0]}`];
        let prev: number = ys[0];
        for (let i: number = 1; i < xs.length; ++i) {
            const separated: boolean = prev < 0 && ys[i] > 600 || prev > 600 && ys[i] < 0;
            pd.push(`${separated ? 'M' : 'L'}${i},${ys[i]}`);
            prev = ys[i];
        }

        path = <SVGPathElement>document.createElementNS(SVG_XMLNS, 'path');
        path.style.fill = 'none';
        path.style.stroke = lightTheme ? '#2a2' : '#4c4';
        path.style.strokeWidth = '2';
        path.setAttribute('d', pd.join(' '));
        image.appendChild(path);
    }

    static debugFormula(source: string): void {
        console.log('DEBUG START');
        console.log('  Formula', source);
        const lexer: FormulaTokenizer = new FormulaTokenizer(source);
        console.log('  Lexer');
        try {
            while (lexer.peek() !== 'EOF') {
                console.log('    TOKEN', lexer.peekToString());
                lexer.skip();
            }
            console.log('    TOKEN', lexer.peekToString());
        } catch (error) {
            console.warn(`    ${getErrorMessage(error)}`);
            console.log('  Error');
            console.log('DEBUG END');
            return;
        }
        console.log('  Parser');
        const parser: FormulaParser = new FormulaParser(source);
        let node: FormulaNode;
        try {
            console.log('    NODE', node = parser.parse());
        } catch (error) {
            console.warn(`    ${getErrorMessage(error)}`);
            console.log('  Error');
            console.log('DEBUG END');
            return;
        }
        console.log('  Evaluation');
        try {
            for (let x: number = -10; x <= 10; ++x) {
                console.log(`    f(${x}) = ${node.eval(x)}`);
            }
        } catch (error) {
            console.warn(`    ${getErrorMessage(error)}`);
            console.log('  Error');
            console.log('DEBUG END');
            return;
        }
        console.log('  Success');
        console.log('DEBUG END');
    }
}
