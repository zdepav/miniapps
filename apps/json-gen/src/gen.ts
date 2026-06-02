export class Config {

    /** Infinite nesting prevention */
    static RECURSION_LIMIT: number = 5;

    /** Max items in arrays or properties in objects */
    static LENGTH_LIMIT: number = 10;

    /** When disabled, all numeric literals will be integers */
    static ALLOW_DECIMALS: boolean = true;
}


function rNumber(allowFloat: boolean): string {
    const r: number = Math.random();
    if (r < 0.3) {
        return `${Math.floor(r * 20) - 2}`;
    } else if (!allowFloat) {
        return `${Math.round(Math.random() * 2e6 - 1e6)}`;
    } else if (r < 0.5) {
        const n: number = Math.random() * 200 - 100;
        const e: number = Math.round(Math.random() * 20 - 10);
        return `${r < 0.75 ? n : Math.round(n)}e${e}`;
    } else {
        const n: number = Math.random() * 2e6 - 1e6;
        return `${r < 0.75 ? n : Math.round(n)}`;
    }
}


const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const ALPHA: string = LOWER + UPPER + '_';
const ALPHANUM: string = ALPHA + '0123456789';
const ASCII: string = ALPHANUM + '\t\r\n !"#$%&\'()*+,-./:;<=>?@[\\]^`{|}~';
const TOP_LEVEL_DOMAINS: Array<string> = [
    'com', 'cz', 'de', 'eu', 'gov', 'io', 'it', 'net', 'org', 'sk', 'us'
];


function randint(max: number): number {
    return Math.floor(Math.random() * max);
}


function char(set: string): string {
    return set.charAt(randint(set.length));
}


function chance(ratio: number): boolean {
    return Math.random() < ratio;
}


function word(body: string, maxLength: number): string;
function word(body: string, minLength: number, maxLength: number): string;
function word(start: string, body: string, maxLength: number): string;
function word(start: string, body: string, minLength: number, maxLength: number): string;
function word(
    start: string,
    body: string | number,
    minLength?: number,
    maxLength?: number
): string {
    if (minLength === undefined) { // word(body, maxLength) overload
        minLength = 1;
        maxLength = <number>body;
        body = start;
    } else if (maxLength === undefined) {
        if (typeof body == 'number') { // word(body, minLength, maxLength) overload
            maxLength = minLength;
            minLength = body;
            body = start;
        } else { // word(start, body, maxLength) overload
            maxLength = minLength;
            minLength = 1;
        }
    }
    const len: number = randint(randint(maxLength + 1 - minLength)) + minLength;
    if (len == 0) {
        return '';
    }
    let ret: string = char(start);
    while (ret.length < len) {
        ret += char(<string>body);
    }
    return ret;
}


function sentence(): string {
    const words: Array<string> = [word(UPPER, LOWER, 15)];
    const len: number = randint(16) + 5;
    while (words.length < len) {
        let w: string = word(LOWER, 15);
        if (words.length == len - 1) {
            w += char('...?!');
        } else if (chance(0.05)) {
            w += ',';
        }
        words.push(w);
    }
    return words.join(' ');
}


function choice<T>(items: Array<T>): T {
    return items[randint(items.length)];
}


function rId(): string {
    return word(ALPHA, ALPHANUM, 20);
}


function rUrl(): string {
    let len: number = randint(randint(3));
    const domain: Array<string> = [];
    while (domain.length < len) {
        domain.push(word(LOWER, 3, 10));
    }
    domain.push(word(LOWER, 3, 20));
    domain.push(choice(TOP_LEVEL_DOMAINS));
    const urlParts: Array<string> = [chance(0.9) ? 'https:/' : 'http:/', domain.join('.')];
    len = randint(4) + 2;
    while (urlParts.length < len) {
        let len2: number = randint(10) + 1;
        const fragment: Array<string> = [word(LOWER, 10)];
        while (fragment.length < len2) {
            fragment.push(word(LOWER, 10));
        }
        urlParts.push(fragment.join('-'));
    }
    let url: string = urlParts.join('/');
    if (chance(0.2)) {
        const args: Array<string> = [];
        len = randint(2) + 1;
        while (args.length < len) {
            args.push(`${word(LOWER, 10)}=${chance(0.5) ? randint(100) : rId()}`);
        }
        url = `${url}?${args.join('&')}`;
    }
    return url;
}

function rString(allowEmpty: boolean = false): string {
    if (allowEmpty && chance(0.1)) {
        return '""';
    }
    switch (randint(6)) {
        case 0: return `"${rNumber(true)}"`;
        case 1: return `"${rId()}"`;
        case 2: return `"${sentence()}"`;
        case 3: return `"${new Date(Math.random() * 905e10 - 53e11).toISOString()}"`;
        case 4: return JSON.stringify(word(ASCII, 0, 100));
        default: return `"${rUrl()}"`;
    }
}

function indentedList(start: string, end: string, indent: string, items: Array<string>): string {
    if (items.length == 0) {
        return start + end;
    }
    return `${start}\n${indent}  ${items.join(`,\n${indent}  `)}\n${indent}${end}`;
}

function rArray(indent: string): string {
    const items: Array<string> = [];
    if (indent.length < Config.RECURSION_LIMIT * 2) {
        const len: number = randint(Config.LENGTH_LIMIT + 1);
        while (items.length < len) {
            items.push(rValue(indent + '  '));
        }
    }
    return indentedList('[', ']', indent, items);
}

function rObject(indent: string): string {
    const props: Array<string> = [];
    const keys: Record<string, boolean> = {};
    if (indent.length < Config.RECURSION_LIMIT * 2) {
        const len: number = randint(Config.LENGTH_LIMIT + 1);
        while (props.length < len) {
            const key: string = chance(0.1) ? rString() : `"${rId()}"`;
            if (key in keys) {
                continue
            }
            keys[key] = true;
            props.push(`${key}: ${rValue(indent + '  ')}`);
        }
    }
    return indentedList('{', '}', indent, props);
}

export function rValue(indent?: string): string {
    if (indent == null) {
        return chance(0.5) ? rArray('') : rObject('');
    }
    const r: number = Math.random();
    switch (Math.floor(r * 5)) {
        case 0: return r < 0.1 ? 'null' : r < 0.15 ? 'true' : 'false';
        case 1: return rNumber(Config.ALLOW_DECIMALS);
        case 2: return rString(true);
        case 3: return rArray(indent);
        default: return rObject(indent);
    }
}
