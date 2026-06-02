import { IO, buildPlaygroundUI } from "@/playgroundUI";
import { DateTime, FixedOffsetZone } from "luxon";
import { pad, parseIntRange } from "@/utils";
import { localizeDate, LocalizedDate } from "@/date";
import { parseFormat, Token } from '@/parser';


const Y2K: Date = new Date(2000, 0, 1, 0, 0, 0, 0);

const DEFAULT_FORMATS: Record<string, string> = {
    py: "%Y-%m-%dT%H:%M:%S.%f%z",
    shP: "%Y-%m-%dT%H:%M:%S",
    shG: "%Y-%m-%dT%H:%M:%S.%N%:z",
    cs: "yyyy-MM-dd'T'HH:mm:ss.fffffffzzz",
    j7: "yyyy-MM-dd'T'HH:mm:ss.SSS",
    j8: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
    jsL: "yyyy-MM-dd'T'HH:mm:ss.uZZ"
};


function tzdirChanged(io: IO): void {
    io.toggleTzDetail(io.getInput("tzdir") !== 'Z');
}


function updateDate(io: IO, when: LocalizedDate): void {
    io.setInput("year", pad(when.date[0], 4));
    io.setInput("month", pad(when.date[1], 2));
    io.setInput("day", pad(when.date[2], 2));
    io.setInput("hour", pad(when.time[0], 2));
    io.setInput("minute", pad(when.time[1], 2));
    io.setInput("second", pad(when.time[2], 2));
    io.setInput("nanos", pad(when.time[3], 9));
    if (when.tz[0] == 0 && when.tz[1] == 0) {
        io.setInput("tzdir", 'Z');
    } else {
        io.setInput("tzdir", when.tz[0] >= 0 ? '+' : '-');
        io.setInput("tzhour", pad(Math.abs(when.tz[0]), 2));
        io.setInput("tzminute", pad(when.tz[1], 2));
    }
    tzdirChanged(io);
}


function getInputDate(io: IO): LocalizedDate {
    const when: LocalizedDate = {
        jsdate: Y2K,
        date: [
            parseIntRange(io.getInput("year"), 101, 9999),
            parseIntRange(io.getInput("month"), 1, 12),
            parseIntRange(io.getInput("day"), 1, 31)
        ],
        time: [
            parseIntRange(io.getInput("hour"), 0, 23),
            parseIntRange(io.getInput("minute"), 0, 59),
            parseIntRange(io.getInput("second"), 0, 59),
            parseIntRange(io.getInput("nanos"), 0, 999999999)
        ],
        tz: [
            parseIntRange(io.getInput("tzhour"), 0, 23),
            parseIntRange(io.getInput("tzminute"), 0, 59)
        ]
    };
    when.jsdate = new Date(
        when.date[0], when.date[1], when.date[2],
        when.time[0], when.time[1], when.time[2],
        Math.floor(when.time[3] / 1000000)
    );
    return when;
}


function apply(io: IO): void {
    let when: LocalizedDate;
    let luxonDate: DateTime | null = null;
    const useLuxon: boolean = io.getInput("lang") === "jsL";
    try {
        when = getInputDate(io);
        if (useLuxon) {
            let tz: FixedOffsetZone;
            if (when.tz[0] == 0 && when.tz[1] == 0) {
                tz = FixedOffsetZone.utcInstance;
            } else {
                tz = FixedOffsetZone.parseSpecifier(
                    `UTC${when.tz[0] >= 0 ? "+" : ""}${pad(when.tz[0], 2)}:${pad(when.tz[1], 2)}`
                );
            }
            luxonDate = DateTime.fromJSDate(when.jsdate).setLocale("en-US").setZone(tz);
        }
    } catch (err) {
        console.error(err);
        io.setErrorOutput("Invalid date");
        return;
    }
    let output: string;
    try {
        if (useLuxon) {
            output = luxonDate!.toFormat(io.getInput("format"));
        } else {
            output = parseFormat(io).map(
                (token: Token): string => token.toString(when)
            ).join('');
        }
    } catch (err) {
        console.error(err);
        io.setErrorOutput("Invalid format string");
        return;
    }
    io.setOutput(output.length > 0 ? output : '\xa0');
}


const FORMATS: Record<string, string> = {};
const UNSUPPORTED_LANGS: Array<string> = ["shG", "j7", "j8"];


export function buildPlayground(parent: HTMLElement): void {
    const io: IO = buildPlaygroundUI(parent);
    updateDate(io, localizeDate());
    for (const lang in DEFAULT_FORMATS) {
        io.setFormatString(lang, FORMATS[lang] = DEFAULT_FORMATS[lang]);
    }
    io.setInput("format", FORMATS.py);
    io.setLanguage("py");
    io.onInput("tzdir", (): void => tzdirChanged(io));
    io.onButton("set-now", (): void => updateDate(io, localizeDate()));
    io.onButton("set-y2k", (): void => updateDate(io, localizeDate(Y2K, [0, 0])));
    io.onButton("reset", (): void => {
        const lang: string = io.getInput("lang");
        io.setInput("format", DEFAULT_FORMATS[lang]);
        io.setFormatString(lang, FORMATS[lang] = DEFAULT_FORMATS[lang]);
        io.setOutput("\xa0");
    });
    io.onButton("apply", (): void => apply(io));
    io.onInput("format", (): void => {
        const lang: string = io.getInput("lang");
        const format: string = io.getInput("format");
        FORMATS[lang] = format;
        io.setFormatString(lang, format);
    });
    io.onInput("lang", (): void => {
        const lang: string = io.getInput("lang");
        io.setLanguage(lang);
        const enabled: boolean = !UNSUPPORTED_LANGS.includes(lang);
        io.toggleButton(
            "apply",
            enabled,
            enabled ? null : "Testing not yet supported for this language"
        );
        io.toggleOutput(enabled);
        io.setInput("format", FORMATS[lang]);
        io.setFormatString(lang, FORMATS[lang]);
        io.setOutput("\xa0");
    });
}
