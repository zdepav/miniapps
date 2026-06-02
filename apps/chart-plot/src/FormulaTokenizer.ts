export type TokenType = (
    'ID' | 'FUNC' | 'NUM' | 'OP' | 'COMMA' | 'VBAR' | 'UNIT' | 'LPAR' | 'RPAR' | 'EOF'
);

class TokenUtils {

    /** Get human-readable representation of a NUM (numeric) token */
    private static numberTokenToString(value?: string | null): string {
        switch (value) {
            case '0': case '0.0': case '0.00': return 'number zero';
            case '1': case '1.0': case '1.00': return 'number one';
            case '2': case '2.0': case '2.00': return 'number two';
            case '3': case '3.0': case '3.00': return 'number three';
            case '4': case '4.0': case '4.00': return 'number four';
            case '5': case '5.0': case '5.00': return 'number five';
            case '6': case '6.0': case '6.00': return 'number six';
            case '7': case '7.0': case '7.00': return 'number seven';
            case '8': case '8.0': case '8.00': return 'number eight';
            case '9': case '9.0': case '9.00': return 'number nine';
            default: return value == null ? 'number' : `number ${value}`;
        }
    }

    /** Get human-readable representation of an OP (operator) token */
    private static operatorTokenToString(value?: string | null): string {
        switch (value) {
            case '+': return 'plus operator';
            case '-': return 'minus operator';
            case '*': return 'multiplication operator';
            case '/': return 'division operator';
            case '^': return 'exponent operator';
            case 'mod': return 'modulo operator';
            default: return 'operator';
        }
    }

    /** Get human-readable representation of a UNIT token */
    private static unitTokenToString(value?: string | null): string {
        switch (value) {
            case 'd': return 'unit (degrees)';
            case 'm': return 'unit (minutes)';
            case 's': return 'unit (seconds)';
            case 'p': return 'unit (percentage)';
            case 'p2': return 'unit (per mille)';
            default: return 'unit';
        }
    }

    /** Get human-readable representation of a LPAR/RPAR (parenthesis or brace) token */
    private static parenthesisTokenToString(left: boolean, value?: string | null): string {
        switch (value) {
            case '[]': return left ? 'left square brace' : 'right square brace';
            case '{}': return left ? 'left bracket' : 'right bracket';
            default: return left ? 'left parenthesis' : 'right parenthesis';
        }
    }

    /** Get human-readable representation of a token without position */
    private static tokenToStringNoPos(type: TokenType, value?: string | null): string {
        switch (type) {
            case 'ID': return value == null ? 'identifier' : `identifier ${value}`;
            case 'FUNC': return value == null ? 'function name' : `function name ${value}`;
            case 'NUM': return TokenUtils.numberTokenToString(value);
            case 'OP': return TokenUtils.operatorTokenToString(value);
            case 'COMMA': return 'comma';
            case 'VBAR': return 'vertical bar';
            case 'UNIT': return TokenUtils.unitTokenToString(value);
            case 'LPAR': return TokenUtils.parenthesisTokenToString(true, value);
            case 'RPAR': return TokenUtils.parenthesisTokenToString(false, value);
            default: return 'end of input';
        }
    }

    /** Get human-readable representation of a token */
    static tokenToString(type: TokenType, value?: string | null, pos?: number): string {
        const desc: string = TokenUtils.tokenToStringNoPos(type, value);
        return pos == null || type == 'EOF' ? desc : `${desc} at column ${pos + 1}`;
    }
}

export default class FormulaTokenizer {

    /** Input substring (`this.source == {Original input}.substring(this.pos)`) */
    private source: string;

    /** Position in input string */
    private pos: number;

    /** Buffered token type or null */
    private buffer: TokenType | null;

    /** Buffered token value, allways lowercase */
    private bufferValue: string;

    /** Buffered token position */
    private bufferPos: number;

    constructor(source: string) {
        this.source = source.toLowerCase(); // case-insensitive input
        this.pos = 0;
        this.buffer = null;
        this.bufferValue = '';
        this.bufferPos = 0;
    }

    /** Get position in input as string */
    position(offset: number = 0): string { return `at column ${this.pos + offset + 1}`; }

    /** Skip until first non-whitespace character */
    private skipWS(): void {
        const len: number = this.source.length;
        this.source = this.source.trimStart();
        this.pos += len - this.source.length;
    }

    /** Save token
     * @param type token type
     * @param value token value (if any)
     * @param pos token position (if negative, current position is used)
     * @returns `type` parameter
     */
    private token<TType extends TokenType>(
        type: TType,
        pos: number = -1,
        value: string = ''
    ): TType {
        this.bufferValue = value;
        this.bufferPos = pos < 0 ? this.pos : pos;
        this.buffer = type;
        return type;
    }

    /** Capture single-character token
     * @param type token type
     * @param value token value (if any)
     * @returns `type` parameter
     */
    private charToken<TType extends TokenType>(type: TType, value: string = ''): TType {
        this.source = this.source.substring(1);
        ++this.pos;
        return this.token<TType>(type, this.pos - 1, value);
    }

    /** Capture identifier */
    private parseID(): 'ID' | 'FUNC' | 'OP' | 'UNIT' {
        let length: number = 1;
        while (length < this.source.length) {
            const char: number = this.source.charCodeAt(length);
            if ((char < 97 || char > 122) && (char < 48 || char > 57) && char != 95) {
                break;
            }
            ++length;
        }
        const id: string = this.source.substring(0, length);
        this.source = this.source.substring(length);
        this.pos += length;
        switch (id) {
            case '\u03c0':
                return this.token('ID', this.pos - length, 'pi');
            case 'pi':
            case 'e':
            case 'x':
                return this.token('ID', this.pos - length, id);
            case 'mod':
                return this.token('OP', this.pos - length, id);
            case 'deg':
                return this.token('UNIT', this.pos - length, 'd');
            default:
                return this.token('FUNC', this.pos - length, id);
        }
    }

    /** Capture numeric literal */
    private parseNumber(startsWithDot: boolean): 'NUM' | 'OP' {
        let length: number = 1;
        let float: boolean = startsWithDot;
        let lastWasDot: boolean = startsWithDot; // used to allow trailing dot
        while (length < this.source.length) {
            const char: number = this.source.charCodeAt(length);
            if (char >= 48 && char <= 57) { // '0'-'9'
                ++length;
                lastWasDot = false;
            } else if (char == 46) { // '.'
                if (float) { // multiple dots
                    throw new Error(`Unexpected '.' ${this.position(length)}`);
                }
                float = true;
                lastWasDot = true;
                ++length;
            } else {
                break;
            }
        }
        if (length == 1 && float) { // no digits (dot only), interpreting as multiplication operator
            return this.charToken('OP', '*');
        }
        const number: string = this.source.substring(0, lastWasDot ? length - 1 : length);
        this.source = this.source.substring(length);
        this.pos += length;
        return this.token('NUM', this.pos - length, startsWithDot ? '0' + number : number);
    }

    /** Get next token type */
    peek(): TokenType {
        if (this.buffer != null) {
            return this.buffer;
        }
        this.skipWS();
        if (this.source.length == 0) {
            return this.token('EOF');
        }
        const char: number = this.source.charCodeAt(0);
        switch (char) {
            case 0x002b: // '+'
                return this.charToken('OP', '+');
            case 0x002d: // '-'
                return this.charToken('OP', '-');
            case 0x002a: // '*'
            case 0x00d7: // '×'
            case 0x22c5: // '⋅'
                return this.charToken('OP', '*');
            case 0x005e: // '^'
                return this.charToken('OP', '^');
            case 0x002f: // '/'
            case 0x003a: // ':'
            case 0x005c: // '\'
            case 0x00f7: // '÷'
                return this.charToken('OP', '/');
            case 0x0028: // '('
                return this.charToken('LPAR', '()');
            case 0x0029: // ')'
                return this.charToken('RPAR', '()');
            case 0x005b: // '['
                return this.charToken('LPAR', '[]');
            case 0x005d: // ']'
                return this.charToken('RPAR', '[]');
            case 0x007b: // '{'
                return this.charToken('LPAR', '{}');
            case 0x007d: // '}'
                return this.charToken('RPAR', '{}');
            case 0x002c: // ','
            case 0x003b: // ';'
                return this.charToken('COMMA');
            case 0x007c: // '|'
                return this.charToken('VBAR');
            case 0x00b0: // '°'
                return this.charToken('UNIT', 'd');
            case 0x0027: // '\''
                return this.charToken('UNIT', 'm');
            case 0x0022: // '"'
                return this.charToken('UNIT', 's');
            case 0x0025: // '%'
                return this.charToken('UNIT', 'p');
            case 0x2030: // '‰'
                return this.charToken('UNIT', 'p2');
            case 0x221a: // '√'
                return this.charToken('FUNC', 'sqrt');
            case 0x00bc: // '¼'
                return this.charToken('NUM', '0.25');
            case 0x00bd: // '½'
                return this.charToken('NUM', '0.5');
            case 0x00be: // '¾'
                return this.charToken('NUM', '0.75');
            case 0x2153: // '⅓'
                return this.charToken('NUM', String(1 / 3));
            case 0x2154: // '⅔'
                return this.charToken('NUM', String(2 / 3));
            case 0x215b: // '⅛'
                return this.charToken('NUM', '0.125');
            case 0x215c: // '⅜'
                return this.charToken('NUM', '0.375');
            case 0x215d: // '⅝'
                return this.charToken('NUM', '0.625');
            case 0x215e: // '⅞'
                return this.charToken('NUM', '0.875');
            case 0x221e: // '∞'
                return this.charToken('NUM', 'Infinity');
        }
        if (char >= 97 && char <= 122) { // 'a'-'z'
            return this.parseID();
        } else if ((char >= 48 && char <= 57) || char == 46) { // '0'-'9' or '.'
            return this.parseNumber(char == 46);
        }
        throw new Error(`Unexpected character '${this.source.charAt(0)}' ${this.position()}`);
    }

    /** Get next token value */
    peekValue(): string {
        this.peek();
        return this.bufferValue;
    }

    /** Get next token position as string
     * @see FormulaLexer.position
     */
    peekPosition(): string {
        this.peek();
        return `at column ${this.bufferPos + 1}`;
    }

    /** Check if next token matches the given type and (optionally) value
     * @param type token type to check for
     * @param value token value to check for
     */
    peekCheck(type: TokenType, value?: string): boolean {
        return this.peek() == type && (value == null || this.bufferValue == value);
    }

    /** Get human-readable representation of the next token */
    peekToString(): string {
        this.peek();
        return TokenUtils.tokenToString(this.buffer!, this.bufferValue, this.bufferPos);
    }

    /** Discard next token
     * @param type if not null, error is thrown it the discarded token's type does not match
     * @param value if not null, error is thrown it the discarded token's value does not match
     * @throws {Error} when expected type is given and does not match
     */
    skip(type?: TokenType, value?: string): void {
        this.peek();
        if (type != null) {
            if (type != this.buffer) {
                throw this.unexpected(TokenUtils.tokenToString(type));
            } else if (value != null && value != this.bufferValue) {
                throw this.unexpected(TokenUtils.tokenToString(type, value));
            }
        }
        this.buffer = null;
    }

    /** Skip next token if it matches the given type and (optionally) value, do nothing otherwise
     * @param type token type to check for
     * @param value token value to check for
     * @returns whether a token was skipped
     */
    trySkip(type: TokenType, value?: string): boolean {
        if (this.peekCheck(type, value)) {
            this.buffer = null;
            return true;
        }
        return false;
    }

    /** Create error for unexpected token
     * @param expected description of expected token
     */
    unexpected(expected?: string): Error {
        if (expected != null) {
            return new Error(`Expected ${expected}, found ${this.peekToString()}`);
        }
        return new Error(`Unexpected ${this.peekToString()}`);
    }
}
