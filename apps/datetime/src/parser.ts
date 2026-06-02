import { IO } from "@/playgroundUI";
import { LocalizedDate as LD, localizedDay } from "@/date";
import { pad } from "@/utils";


interface NameSets {
    letter: Array<string>;
    abbr: Array<string>;
    full: Array<string>;
}


interface Names {
    month: NameSets;
    weekday: NameSets;
}


const NAMES: Names = {
    month: {
        letter: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
        abbr: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        full: [
            "January", "February", "March", "April", "May", "June", "July",
            "August", "September", "October", "November", "December"
        ]
    },
    weekday: {
        letter: ["S", "M", "T", "W", "T", "F", "S"],
        abbr: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        full: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    }
};

const RANGE_1_9: Array<number> = [1, 2, 3, 4, 5, 6, 7, 8, 9];


const MONTH_OFFSETS = {
    common: [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
    leap: [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335]
};


function getDayOfYear(when: LD): number {
    const year: number = when.date[0];
    return MONTH_OFFSETS[
        year % 4 == 0 && (year % 400 == 0 || year % 100 != 0) ? "leap" : "common"
    ][when.date[1] - 1] + when.date[2];
}


enum WeekOfYearMode { MONDAY = 0, SUNDAY = 1, ISO = 2 }


function getWeekOfYear(when: LD, mode: WeekOfYearMode): number {
    const yearDay: number = getDayOfYear(when);
    const weekdayOfYear: number = (when.jsdate.getDay() + 8 - yearDay % 7) % 7;
    if (mode == WeekOfYearMode.SUNDAY) {
        return Math.floor((yearDay + weekdayOfYear + (weekdayOfYear > 0 ? -1 : 6)) / 7);
    } else if (mode == WeekOfYearMode.MONDAY) {
        return Math.floor((yearDay + weekdayOfYear + (weekdayOfYear > 1 ? -2 : 5)) / 7);
    }
    const w: number = Math.floor((yearDay + weekdayOfYear + (weekdayOfYear > 4 ? -2 : 5)) / 7);
    if (w == 0 && when.date[1] == 1) {
        return getWeekOfYear(localizedDay(when.date[0] - 1, 12, 31), mode);
    } else if (w < 53) {
        return w;
    }
    const weekdayOfNextYear: number = new Date(when.date[0] + 1, 0, 1).getDay();
    return weekdayOfNextYear > 1 && weekdayOfNextYear < 5 ? 1 : 53;
}


export interface Token {
    toString(date: LD): string;
}


const SEC_FRAC_DIVIDERS: Array<number> = [
    100000000, 10000000, 1000000, 100000, 10000, 1000, 100, 10, 1
];


class SecondFractionToken implements Token {
    digits: number;
    blankIfZero: boolean;

    constructor(digits: number, blankIfZero: boolean = false) {
        if (!Number.isInteger(digits) || digits < 1 || digits > 9) {
            throw new Error("Fraction of a second must have 1-9 digits");
        }
        this.digits = digits;
        this.blankIfZero = blankIfZero;
    }

    toString(when: LD): string {
        if (this.blankIfZero && when.time[3] == 0) {
            return '';
        }
        return pad(Math.floor(when.time[3] / SEC_FRAC_DIVIDERS[this.digits - 1]), this.digits);
    }
}


class ConstToken implements Token {
    str: string;

    constructor(str: string) {
        this.str = str;
    }

    toString(): string {
        return this.str;
    }
}


function token(toString: (when: LD) => string): Token {
    return { toString };
}


class Tokens {

    /** Century, 1+ digits (e.g. "8") */
    static readonly century1: Token = token((when: LD): string => {
        return String(Math.floor(when.date[0] / 100))
    });

    /** Century, 2+ digits (e.g. "08") */
    static readonly century2: Token = token((when: LD): string => {
        return pad(Math.floor(when.date[0] / 100), 2)
    });

    /** Year, last at most 2 digits (e.g. "7") */
    static readonly year1: Token = token((when: LD): string => String(when.date[0] % 100));

    /** Year, last 2 digits (e.g. "07") */
    static readonly year2: Token = token((when: LD): string => pad(when.date[0] % 100, 2));

    /** Year, 3+ digits (e.g. "983" or "2007") */
    static readonly year3: Token = token((when: LD): string => pad(when.date[0], 3));

    /** Year, 4+ digits (e.g. "2007") */
    static readonly year4: Token = token((when: LD): string => pad(when.date[0], 4));

    /** Year, 5+ digits (e.g. "02007") */
    static readonly year5: Token = token((when: LD): string => pad(when.date[0], 5));

    /** Month, 1-2 digits ("1".."12") */
    static readonly month1: Token = token((when: LD): string => String(when.date[1]));

    /** Month, 2 digits ("01".."12") */
    static readonly month2: Token = token((when: LD): string => pad(when.date[1], 2));

    /** Month, abbreviated (e.g. "Jan") */
    static readonly monthAbbr: Token = token((when: LD): string => {
        return NAMES.month.abbr[when.date[1] - 1];
    });

    /** Month, full name (e.g. "January") */
    static readonly monthName: Token = token((when: LD): string => {
        return NAMES.month.full[when.date[1] - 1];
    });

    /** Month, padded to 2 characters (" 1".."12") */
    static readonly monthS2: Token = token((when: LD): string => pad(when.date[1], 2, false, ' '));

    /** Week number, weeks start with monday ("0".."53") */
    static readonly weekM: Token = token((when: LD): string => {
        return pad(getWeekOfYear(when, WeekOfYearMode.MONDAY), 2);
    });

    /** Week number, weeks start with sunday ("0".."53") */
    static readonly weekS: Token = token((when: LD): string => {
        return pad(getWeekOfYear(when, WeekOfYearMode.SUNDAY), 2);
    });

    /** Week number, ISO ("1".."53") */
    static readonly weekISO: Token = token((when: LD): string => {
        return pad(getWeekOfYear(when, WeekOfYearMode.ISO), 2);
    });

    /** Day of month, 1-2 digits ("1".."31") */
    static readonly day1: Token = token((when: LD): string => String(when.date[2]));

    /** Day of month, 2 digits ("01".."31") */
    static readonly day2: Token = token((when: LD): string => pad(when.date[2], 2));

    /** Day of month, padded to 2 characters (" 1".."31") */
    static readonly dayS2: Token = token((when: LD): string => pad(when.date[2], 2, false, ' '));

    /** Day of year, 1-3 digits ("1".."366") */
    static readonly dayYear: Token = token((when: LD): string => String(getDayOfYear(when)));

    /** Day of year, 3 digits ("001".."366") */
    static readonly dayYear3: Token = token((when: LD): string => pad(getDayOfYear(when), 3));

    /** Day of week, 1 digit, starting with 1 ~ monday ("1".."7") */
    static readonly weekdayM: Token = token((when: LD): string => {
        return String((when.jsdate.getDay() + 6) % 7 + 1);
    });

    /** Day of week, first letter (e.g. "M") */
    static readonly weekdayLetter: Token = token((when: LD): string => {
        return NAMES.weekday.letter[when.jsdate.getDay()];
    });

    /** Day of week, abbreviated (e.g. "Mon") */
    static readonly weekdayAbbr: Token = token((when: LD): string => {
        return NAMES.weekday.abbr[when.jsdate.getDay()];
    });

    /** Day of week, full name (e.g. "Monday") */
    static readonly weekdayName: Token = token((when: LD): string => {
        return NAMES.weekday.full[when.jsdate.getDay()];
    });

    /** Day of week, 1 digit, starting with 0 ~ sunday ("0".."6") */
    static readonly weekdayS: Token = token((when: LD): string => {
        return when.jsdate.getDay().toString();
    });

    /** Hour, 12-hour format, 1-2 digits ("1".."12") */
    static readonly hour12_1: Token = token((when: LD): string => {
        return when.time[0] % 12 > 0 ? String(when.time[0] % 12) : '12';
    });

    /** Hour, 12-hour format, 2 digits ("01".."12") */
    static readonly hour12_2: Token = token((when: LD): string => {
        return when.time[0] % 12 > 0 ? pad(when.time[0] % 12, 2) : '12';
    });

    /** Hour, 12-hour format, padded to 2 characters (" 1".."12") */
    static readonly hour12_S2: Token = token((when: LD): string => {
        return when.time[0] % 12 > 0 ? pad(when.time[0] % 12, 2, false, ' ') : '12';
    });

    /** Hour, 24-hour format, 1-2 digits ("0".."23") */
    static readonly hour24_1: Token = token((when: LD): string => String(when.time[0]));

    /** Hour, 24-hour format, 2 digits ("00".."23") */
    static readonly hour24_2: Token = token((when: LD): string => pad(when.time[0], 2));

    /** Hour, 24-hour format, padded to 2 characters (" 0".."23") */
    static readonly hour24_S2: Token = token((when: LD): string => {
        return pad(when.time[0], 2, false, ' ');
    });

    /** Minute, 1-2 digits (e.g. "1") */
    static readonly minute1: Token = token((when: LD): string => String(when.time[1]));

    /** Minute, 2 digits (e.g. "01") */
    static readonly minute2: Token = token((when: LD): string => pad(when.time[1], 2));

    /** Second, 1-2 digits (e.g. "1") */
    static readonly second1: Token = token((when: LD): string => String(when.time[2]));

    /** Second, 2 digits (e.g. "01") */
    static readonly second2: Token = token((when: LD): string => pad(when.time[2], 2));

    /** first 1..9 digits */
    static readonly nanoseconds: Array<Token> = (
        RANGE_1_9.map((n: number): Token => new SecondFractionToken(n))
    );

    /** first 1..9 digits or nothing if nanoseconds are 0 */
    static readonly nanosecondsOpt: Array<Token> = (
        RANGE_1_9.map((n: number): Token => new SecondFractionToken(n, true))
    );

    /** Time period ("A.D.") */
    static readonly period: Token = new ConstToken("A.D.");

    /** Part of day, 1 letter ("A" or "P") */
    static readonly ampm1: Token = token((when: LD): string => when.time[0] < 12 ? "A" : "P");

    /** Part of day, 2 letters ("AM" or "PM") */
    static readonly ampm2: Token = token((when: LD): string => when.time[0] < 12 ? "AM" : "PM");

    /** Timezone, hour only, 1-2 digits (e.g. "+2") */
    static readonly timezone1: Token = token((when: LD): string => pad(when.tz[0], 1, true));

    /** Timezone, hour only, 2 digits (e.g. "+02") */
    static readonly timezone2: Token = token((when: LD): string => pad(when.tz[0], 2, true));

    /** Timezone, hours and minutes without separator, each 2 digits (e.g. "+0200") */
    static readonly timezone4: Token = token((when: LD): string => {
        return pad(when.tz[0], 2, true) + pad(when.tz[1], 2);
    });

    /** Timezone, separated hours and minutes, each 2 digits (e.g. "+02:00") */
    static readonly timezoneTime: Token = token((when: LD): string => {
        return `${pad(when.tz[0], 2, true)}:${pad(when.tz[1], 2)}`;
    });

    /** Timezone, "Z" if UTC, otherwise same as `timezoneTime` (e.g. "+02:00" or "Z") */
    static readonly timezoneOpt: Token = token((when: LD): string => {
        return when.tz[0] == 0 && when.tz[1] == 0 ? 'Z' : Tokens.timezoneTime.toString(when);
    });

    /** Timezone, abbreviated (e.g. "GMT") */
    static readonly timezoneAbbr: Token = token((when: LD): string => {
        return when.jsdate.toLocaleDateString('en-US', { timeZoneName: 'short' }).split(', ')[1];
    });
}


class ParserState {
    tokens: Array<Token>;
    fmt: string;
    i: number;

    get char(): string {
        return this.fmt.charAt(this.i);
    }

    get charCode(): number {
        return this.fmt.charCodeAt(this.i);
    }

    get eof(): boolean {
        return this.i >= this.fmt.length;
    }

    constructor(fmt: string) {
        this.tokens = [];
        this.fmt = fmt;
        this.i = 0;
    }

    addToken(token: Token): void {
        this.tokens.push(token)
    }

    addConstToken(str: string): void {
        const len: number = this.tokens.length;
        if (len > 0 && this.tokens[len - 1] instanceof ConstToken) {
            (<ConstToken>this.tokens[len - 1]).str += str;
        } else {
            this.tokens.push(new ConstToken(str));
        }
    }

    addMultiletterToken(
        maxCount: number,
        tokens: Array<Token>,
        offset: number = 0
    ): void {
        let n: number = 1;
        const letter: number = this.charCode;
        ++this.i;
        while (!this.eof && n < maxCount && this.charCode == letter) {
            ++n;
            ++this.i;
        }
        this.tokens.push(tokens[(n + offset - 1) % tokens.length]);
    }

    addQuotedConstToken(): void {
        const quote: number = this.charCode;
        ++this.i;
        const buffer: Array<string> = [];
        while (!this.eof) {
            const ch: number = this.charCode;
            if (ch == 92) {
                ++this.i;
                if (!this.eof) {
                    buffer.push(this.char);
                    ++this.i;
                }
            } else if (ch == quote) {
                ++this.i;
                this.tokens.push(new ConstToken(buffer.join('')));
                return;
            } else {
                buffer.push(this.char);
                ++this.i;
            }
        }
        throw new Error('Unterminated string');
    }
}


class CSharpTokenVariants {

    static readonly period: Array<Token> = [Tokens.period, Tokens.period];

    static readonly year: Array<Token> = [
        Tokens.year1, Tokens.year2, Tokens.year3, Tokens.year4, Tokens.year5
    ];

    static readonly month: Array<Token> = [
        Tokens.month1, Tokens.month2, Tokens.monthAbbr, Tokens.monthName, Tokens.monthS2
    ];

    static readonly day: Array<Token> = [
        Tokens.day1, Tokens.day2, Tokens.weekdayAbbr, Tokens.weekdayName
    ];

    static readonly ampm: Array<Token> = [Tokens.ampm1, Tokens.ampm2];

    static readonly hour24: Array<Token> = [Tokens.hour24_1, Tokens.hour24_2, Tokens.hour24_S2];

    static readonly hour12: Array<Token> = [Tokens.hour12_1, Tokens.hour12_2, Tokens.hour12_S2];

    static readonly minute: Array<Token> = [Tokens.minute1, Tokens.minute2];

    static readonly second: Array<Token> = [Tokens.second1, Tokens.second2];

    static readonly timezone: Array<Token> = [
        Tokens.timezone1, Tokens.timezone2, Tokens.timezoneTime
    ];
}


function parseCSharpFormat(fmt: string): Array<Token> {
    const state: ParserState = new ParserState(fmt);
    while (!state.eof) switch (state.charCode) {
        case 70: // F
            state.addMultiletterToken(7, Tokens.nanosecondsOpt);
            break;
        case 72: // H
            state.addMultiletterToken(2, CSharpTokenVariants.hour24);
            break;
        case 75: // K
            state.addToken(Tokens.timezone4);
            ++state.i;
            break;
        case 77: // M
            state.addMultiletterToken(4, CSharpTokenVariants.month);
            break;
        case 100: // d
            state.addMultiletterToken(4, CSharpTokenVariants.day);
            break;
        case 102: // f
            state.addMultiletterToken(7, Tokens.nanoseconds);
            break;
        case 103: // g
            state.addMultiletterToken(2, CSharpTokenVariants.period);
            break;
        case 104: // h
            state.addMultiletterToken(2, CSharpTokenVariants.hour12);
            break;
        case 109: // m
            state.addMultiletterToken(2, CSharpTokenVariants.minute);
            break;
        case 115: // s
            state.addMultiletterToken(2, CSharpTokenVariants.second);
            break;
        case 116: // t
            state.addMultiletterToken(2, CSharpTokenVariants.ampm);
            break;
        case 121: // y
            state.addMultiletterToken(5, CSharpTokenVariants.year);
            break;
        case 122: // z
            state.addMultiletterToken(3, CSharpTokenVariants.timezone);
            break;
        case 34: case 39: // " '
            state.addQuotedConstToken();
            break;
        case 37: // %
            ++state.i;
            break;
        case 92: // \
            ++state.i;
            if (!state.eof) {
                state.addConstToken(state.char);
                ++state.i;
            }
            break;
        default: // ignoring : and / as they have no effect in english locale
            state.addConstToken(state.char);
            ++state.i;
            break;
    }
    return state.tokens;
}


function addPythonToken(state: ParserState): void {
    if (state.eof) {
        return;
    }
    switch (state.charCode) {
        case 65: // A
            state.addToken(Tokens.weekdayName);
            return;
        case 66: // B
            state.addToken(Tokens.monthName);
            return;
        case 72: // H
            state.addToken(Tokens.hour24_2);
            return;
        case 73: // I
            state.addToken(Tokens.hour12_2);
            return;
        case 77: // M
            state.addToken(Tokens.minute2);
            return;
        case 83: // S
            state.addToken(Tokens.second2);
            return;
        case 85: // U
            state.addToken(Tokens.weekS);
            return;
        case 87: // W
            state.addToken(Tokens.weekM);
            return;
        case 88: // X
            state.addToken(Tokens.hour24_2);
            state.addConstToken(":");
            state.addToken(Tokens.minute2);
            state.addConstToken(":");
            state.addToken(Tokens.second2);
            return;
        case 89: // Y
            state.addToken(Tokens.year4);
            return;
        case 90: // Z
            state.addToken(Tokens.timezoneAbbr);
            return;
        case 97: // a
            state.addToken(Tokens.weekdayAbbr);
            return;
        case 98: // b
            state.addToken(Tokens.monthAbbr);
            return;
        case 99: // c
            // Tue Aug 16 21:30:00 1988
            state.addToken(Tokens.weekdayAbbr);
            state.addConstToken(" ");
            state.addToken(Tokens.monthAbbr);
            state.addConstToken(" ");
            state.addToken(Tokens.dayS2);
            state.addConstToken(" ");
            state.addToken(Tokens.hour24_S2);
            state.addConstToken(":");
            state.addToken(Tokens.minute2);
            state.addConstToken(":");
            state.addToken(Tokens.second2);
            state.addConstToken(" ");
            state.addToken(Tokens.year4);
            return;
        case 100: // d
            state.addToken(Tokens.day2);
            return;
        case 102: // f
            state.addToken(Tokens.nanoseconds[5]);
            return;
        case 106: // j
            state.addToken(Tokens.dayYear3);
            return;
        case 109: // m
            state.addToken(Tokens.month2);
            return;
        case 112: // p
            state.addToken(Tokens.ampm2);
            return;
        case 119: // w
            state.addToken(Tokens.weekdayS);
            return;
        case 120: // x
            state.addToken(Tokens.month2);
            state.addConstToken("/");
            state.addToken(Tokens.day2);
            state.addConstToken("/");
            state.addToken(Tokens.year4);
            return;
        case 121: // y
            state.addToken(Tokens.year2);
            return;
        case 122: // z
            state.addToken(Tokens.timezone4);
            return;
        default:
            state.addConstToken(state.char);
            return;
    }
}


function parsePythonFormat(fmt: string): Array<Token> {
    const state: ParserState = new ParserState(fmt);
    while (!state.eof) {
        if (state.charCode != 37) {
            state.addConstToken(state.char);
            ++state.i;
            continue;
        }
        ++state.i;
        addPythonToken(state);
        ++state.i;
    }
    return state.tokens;
}


function addPosixShellToken(state: ParserState, ): void {
    if (state.eof) {
        return;
    }
    switch (state.charCode) {
        case 64: // A
            state.addToken(Tokens.weekdayName);
            return;
        case 65: // B
            state.addToken(Tokens.monthName);
            return;
        case 66: // C
            state.addToken(Tokens.century2);
            return;
        case 67: case 120: // D x
            state.addToken(Tokens.month2);
            state.addConstToken("/");
            state.addToken(Tokens.day2);
            state.addConstToken("/");
            state.addToken(Tokens.year2);
            return;
        case 72: // H
            state.addToken(Tokens.hour24_2);
            return;
        case 73: // I
            state.addToken(Tokens.hour12_2);
            return;
        case 77: // M
            state.addToken(Tokens.minute2);
            return;
        case 83: // S
            state.addToken(Tokens.second2);
            return;
        case 84: // T
            state.addToken(Tokens.hour24_2);
            state.addConstToken(":");
            state.addToken(Tokens.minute2);
            state.addConstToken(":");
            state.addToken(Tokens.second2);
            return;
        case 85: // U
            state.addToken(Tokens.weekS);
            return;
        case 86: // V
            state.addToken(Tokens.weekISO);
            return;
        case 87: // W
            state.addToken(Tokens.weekM);
            return;
        case 88: case 114: // X r
            state.addToken(Tokens.hour12_2);
            state.addConstToken(":");
            state.addToken(Tokens.minute2);
            state.addConstToken(":");
            state.addToken(Tokens.second2);
            state.addConstToken(" ");
            state.addToken(Tokens.ampm2);
            return;
        case 89: // Y
            state.addToken(Tokens.year4);
            return;
        case 90: // Z
            state.addToken(Tokens.timezoneAbbr);
            return;
        case 97: // a
            state.addToken(Tokens.weekdayAbbr);
            return;
        case 98: case 104: // b h
            state.addToken(Tokens.monthAbbr);
            return;
        case 99: // c
            state.addToken(Tokens.weekdayAbbr);
            state.addConstToken(", ");
            state.addToken(Tokens.monthAbbr);
            state.addConstToken(" ");
            state.addToken(Tokens.dayS2);
            state.addConstToken(", ");
            state.addToken(Tokens.year3);
            state.addConstToken(" ");
            state.addToken(Tokens.hour12_S2);
            state.addConstToken(":");
            state.addToken(Tokens.minute2);
            state.addConstToken(":");
            state.addToken(Tokens.second2);
            state.addConstToken(" ");
            state.addToken(Tokens.ampm2);
            return;
        case 100: // d
            state.addToken(Tokens.month2);
            return;
        case 101: // e
            state.addToken(Tokens.monthS2);
            return;
        case 106: // j
            state.addToken(Tokens.dayYear3);
            return;
        case 109: // m
            state.addToken(Tokens.month2);
            return;
        case 110: // n
            state.addConstToken("\n");
            return;
        case 112: // p
            state.addToken(Tokens.ampm2);
            return;
        case 116: // t
            state.addConstToken("\t");
            return;
        case 117: // u
            state.addToken(Tokens.weekdayM);
            return;
        case 119: // w
            state.addToken(Tokens.weekdayS);
            return;
        case 121: // y
            state.addToken(Tokens.year2);
            return;
        default:
            state.addConstToken(state.char);
            return;
    }
}


function parseShellFormat(fmt: string, gnu: boolean): Array<Token> {
    if (gnu) {
        return [new ConstToken("GNU Shell not implemented")]; // TODO
    }
    const state: ParserState = new ParserState(fmt);
    while (!state.eof) {
        if (state.charCode != 37) {
            state.addConstToken(state.char);
            ++state.i;
            continue;
        }
        ++state.i;
        if (gnu) {
            // addGNUShellToken(state);
        } else {
            addPosixShellToken(state);
        }
        ++state.i;
    }
    return state.tokens;
}


function parseJava7Format(_fmt: string): Array<Token> {
    return [new ConstToken("Java 7 not implemented")]; // TODO
}


function parseJava8Format(_fmt: string): Array<Token> {
    return [new ConstToken("Java 8+ not implemented")]; // TODO
}


export function parseFormat(io: IO): Array<Token> {
    const fmt: string = io.getInput("format");
    switch (io.getInput("lang")) {
        case "py": return parsePythonFormat(fmt);
        case "shP": return parseShellFormat(fmt, false);
        case "shG": return parseShellFormat(fmt, true);
        case "cs": return parseCSharpFormat(fmt);
        case "j7": return parseJava7Format(fmt);
        case "j8": return parseJava8Format(fmt);
        default: throw new Error(); // should be unreachable
    }
}
