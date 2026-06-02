import FormulaTokenizer, { TokenType } from '@/FormulaTokenizer';
import FormulaNode from '@/nodes/FormulaNode';
import NumberNode from '@/nodes/NumberNode';
import VarNode from '@/nodes/VarNode';
import FuncNode, { MathFunc } from '@/nodes/FuncNode';
import UnaryNode, { UnaryOperator } from '@/nodes/UnaryNode';
import OpNode, { Operator } from '@/nodes/OpNode';

export default class FormulaParser {

    private lexer: FormulaTokenizer;

    constructor(source: string) {
        this.lexer = new FormulaTokenizer(source);
    }

    private parseValue(): FormulaNode {
        /* grammar value
         *   : ID
         *   : NUM
         *   : LPAR['()'] modulo_expression RPAR['()']
         *   : LPAR['[]'] modulo_expression RPAR['[]']
         *   : LPAR['{}'] modulo_expression RPAR['{}']
         *   : VBAR modulo_expression VBAR
         */
        const type: TokenType = this.lexer.peek();
        if (type == 'ID') {
            switch (this.lexer.peekValue()) {
                case 'pi': this.lexer.skip(); return NumberNode.PI;
                case 'e': this.lexer.skip(); return NumberNode.E;
                default: this.lexer.skip(); return VarNode.X;
            }
        } else if (type == 'LPAR') {
            // all three brace types are allowed as long as left and right match
            const kind: string = this.lexer.peekValue();
            this.lexer.skip();
            const node: FormulaNode = this.parseModuloExpression();
            this.lexer.skip('RPAR', kind);
            return node;
        } else if (type == 'VBAR') {
            this.lexer.skip();
            const node: FormulaNode = this.parseModuloExpression();
            this.lexer.skip('VBAR');
            return new FuncNode(MathFunc.ABS, [node]);
        } else if (type == 'NUM') {
            const value: number = parseFloat(this.lexer.peekValue());
            this.lexer.skip();
            return new NumberNode(value);
        } else {
            throw this.lexer.unexpected();
        }
    }

    private parseUnaryExpression(): FormulaNode {
        /* grammar unary_expression
         *   : ( OP['-'] | OP['+'] )* value ( UNIT )*
         */
        let negated: boolean = false;
        while (this.lexer.peek() == 'OP') {
            const kind: string = this.lexer.peekValue();
            if (kind == '+') {
                this.lexer.skip();
            } else if (kind == '-') {
                negated = !negated;
                this.lexer.skip();
            } else {
                break;
            }
        }
        let node: FormulaNode = this.parseValue();
        while (this.lexer.peek() == 'UNIT') {
            switch (this.lexer.peekValue()) {
                case 'd':
                    node = new UnaryNode(UnaryOperator.DEGREE, node);
                    break;
                case 'm':
                    node = new UnaryNode(UnaryOperator.MINUTE, node);
                    break;
                case 's':
                    node = new UnaryNode(UnaryOperator.SECOND, node);
                    break;
                case 'p':
                    node = new UnaryNode(UnaryOperator.PERCENT, node);
                    break;
                case 'p2':
                    node = new UnaryNode(UnaryOperator.PERMILLE, node);
                    break;
                default:
                    throw this.lexer.unexpected();
            }
            this.lexer.skip();
        }
        return negated ? new UnaryNode(UnaryOperator.NEG, node) : node;
    }

    private parseFunctionExpression(): FormulaNode {
        /* grammar function_expression
         *   : FUNC unary_expression
         *   : FUNC LPAR['()'] modulo_expression ( COMMA modulo_expression )* RPAR['()']
         *   : unary_expression
         */
        if (this.lexer.peek() != 'FUNC') {
            return this.parseUnaryExpression();
        }
        const name: string = this.lexer.peekValue();
        const func: MathFunc | undefined = MathFunc.tryGetByName(name);
        if (func == null) {
            throw new Error(`Unrecognized function name ${name} ${this.lexer.peekPosition()}`);
        }
        this.lexer.skip(); // discard function name
        if (this.lexer.trySkip('LPAR', '()')) {
            const args: FormulaNode[] = [];
            args.push(this.parseModuloExpression());
            while (this.lexer.trySkip('COMMA')) {
                args.push(this.parseModuloExpression());
            }
            this.lexer.skip('RPAR', '()');
            return new FuncNode(func, args);
        }
        return new FuncNode(func, [this.parseUnaryExpression()]);
    }

    private parseExponentExpression(): FormulaNode {
        /* grammar exponent_expression
         *   : function_expression ( OP['^'] function_expression )*
         */
        let node: FormulaNode = this.parseFunctionExpression();
        while (this.lexer.trySkip('OP', '^')) {
            node = new OpNode(node, Operator.POW, this.parseFunctionExpression());
        }
        return node;
    }

    private parseMultiplicativeExpression(): FormulaNode {
        /* grammar multiplicative_expression
         *   : exponent_expression ( ( OP['*'] | OP['/'] ) exponent_expression )*
         */
        let node: FormulaNode = this.parseExponentExpression();
        while (true) {
            if (this.lexer.trySkip('OP', '*')) {
                node = new OpNode(node, Operator.MUL, this.parseExponentExpression());
            } else if (this.lexer.trySkip('OP', '/')) {
                node = new OpNode(node, Operator.DIV, this.parseExponentExpression());
            } else {
                break;
            }
        }
        return node;
    }

    private parseAdditiveExpression(): FormulaNode {
        /* grammar additive_expression
         *   : multiplicative_expression ( ( OP['+'] | OP['-'] ) multiplicative_expression )*
         */
        let node: FormulaNode = this.parseMultiplicativeExpression();
        while (true) {
            if (this.lexer.trySkip('OP', '+')) {
                node = new OpNode(node, Operator.ADD, this.parseMultiplicativeExpression());
            } else if (this.lexer.trySkip('OP', '-')) {
                node = new OpNode(node, Operator.SUB, this.parseMultiplicativeExpression());
            } else {
                break;
            }
        }
        return node;
    }

    private parseModuloExpression(): FormulaNode {
        /* grammar modulo_expression
         *   : additive_expression ( OP['mod'] additive_expression )*
         */
        let node: FormulaNode = this.parseAdditiveExpression();
        while (this.lexer.trySkip('OP', 'mod')) {
            node = new OpNode(node, Operator.MOD, this.parseAdditiveExpression());
        }
        return node;
    }

    parse(): FormulaNode {
        let expr: FormulaNode = this.parseModuloExpression();
        if (this.lexer.peek() != 'EOF') {
            throw this.lexer.unexpected();
        }
        return expr;
    }
}
