const SVGNS: "http://www.w3.org/2000/svg" = "http://www.w3.org/2000/svg";


const ICON_DOCS_PATH_DATA: string = (
    "M0,3a2,2,0,0,1,2-2h5c0,0,1,0,2,1l2,2c1,1,1,2,1,2v8a2,2,0,0,1-2,2h-8a2,2,0,0,1-2-2zM1,14a1,1,0,"
    + "0,0,1,1h8a1,1,0,0,0,1-1v-7a1,1,0,0,0-1-1h-2a1,1,0,0,1-1-1v-2a1,1,0,0,0-1-1h-4a1,1,0,0,0-1,1z"
    + "M3,4c-1,0-1-1,0-1h2c1,0,1,1,0,1zM3,6c-1,0-1-1,0-1h2c1,0,1,1,0,1zM3,8c-1,0-1-1,0-1h6c1,0,1,1,"
    + "0,1zM3,10c-1,0-1-1,0-1h6c1,0,1,1,0,1zM3,12c-1,0-1-1,0-1h6c1,0,1,1,0,1zM3,14c-1,0-1-1,0-1h6c1"
    + ",0,1,1,0,1z"
);

interface Column {
    title?: string;
    subtitle?: string;
    docs?: string;
    year: string;
    month: string;
    monthFull: string;
    day: string;
    weekday: string;
    dayYear: string | null;
    hour: string;
    minute: string;
    second: string;
    millis: string | null;
    micros: string | null;
    nanos: string | null;
    tzNoColon: string | null;
    tzColon: string | null;
    tzAbbr: string | null;
    special: string;
    esc: string;
}


const COLUMNS: Array<Column> = [
    {
        year: "1980, 2024", month: "01, 12", monthFull: "April, July", day: "01, 31",
        weekday: "Tuesday", dayYear: "001, 366", hour: "01, 23", minute: "01, 59", second: "01, 59",
        millis: "000, 999", micros: "492835", nanos: "492835167", tzNoColon: "+0200",
        tzColon: "+02:00", tzAbbr: "UTC, CEST", special: "", esc: "%%, \\T, 'T'"
    },
    {
        title: "Python", year: "%Y", month: "%m", monthFull: "%B", day: "%d", weekday: "%A",
        dayYear: "%j", hour: "%H", minute: "%M", second: "%S", millis: null, micros: "%f",
        nanos: null, tzNoColon: "%z", tzColon: null, tzAbbr: "%Z", special: "%", esc: "%",
        docs: "https://docs.python.org/3/library/datetime.html#strftime-strptime-behavior"
    },
    {
        title: "Shell", subtitle: "(Posix)", year: "%Y", month: "%m", monthFull: "%B", day: "%d",
        weekday: "%A", dayYear: "%j", hour: "%H", minute: "%M", second: "%S", millis: null,
        micros: null, nanos: null, tzNoColon: null, tzColon: null, tzAbbr: "%Z", special: "%",
        esc: "%", docs: "https://unix.com/man-page/posix/1P/date"
    },
    {
        title: "Shell", subtitle: "(GNU)", year: "%Y", month: "%m", monthFull: "%B", day: "%d",
        weekday: "%A", dayYear: "%j", hour: "%H", minute: "%M", second: "%S", millis: null,
        micros: null, nanos: "%N", tzNoColon: "%z", tzColon: "%:z", tzAbbr: "%Z", special: "%",
        esc: "%", docs: "https://man7.org/linux/man-pages/man1/date.1.html"
    },
    {
        title: "C#", year: "yyyy", month: "MM", monthFull: "MMMM", dayYear: null, weekday: "dddd",
        day: "dd", tzNoColon: null, minute: "mm", second: "ss", millis: "fff", micros: "ffffff",
        nanos: null, tzColon: "zzz", tzAbbr: null, special: ":/\\%\"'", esc: "\\\"'", hour: "HH",
        docs: "https://learn.microsoft.com/en-us/dotnet/standard/base-types/custom-date-and-time-format-strings"
    },
    {
        title: "Java 7", year: "yyyy", month: "MM", monthFull: "MMMM", day: "dd", weekday: "EEEE",
        dayYear: "DDD", hour: "HH", minute: "mm", second: "ss", millis: "SSS", micros: null,
        nanos: null, tzNoColon: null, tzColon: null, tzAbbr: "z", special: "'", esc: "'",
        docs: "https://docs.oracle.com/javase/7/docs/api/java/text/SimpleDateFormat.html"
    },
    {
        title: "Java 8+", year: "yyyy", month: "MM", monthFull: "MMMM", day: "dd", weekday: "EEEE",
        dayYear: "DDD", hour: "HH", minute: "mm", second: "ss", millis: "SSS", nanos: "SSSSSSSSS",
        micros: "SSSSSS", tzNoColon: "xx", tzColon: "xxx", tzAbbr: "z", special: "[]#{}'", esc: "'",
        docs: "https://docs.oracle.com/javase/8/docs/api/java/time/format/DateTimeFormatter.html"
    },
    {
        title: "JavaScript", subtitle: "(Luxon)", year: "yyyy", month: "MM", monthFull: "MMMM",
        day: "dd", weekday: "EEE", dayYear: "ooo", hour: "HH", minute: "mm", second: "ss",
        millis: "u", micros: null, nanos: null, tzNoColon: "ZZZ", tzColon: "ZZ", tzAbbr: "ZZZZ",
        special: "'", esc: "'", docs: "https://moment.github.io/luxon/index.html#/formatting"
    }
];


function docsCell(cell: HTMLTableCellElement, column: Column): void {
    if (!("docs" in column)) {
        return;
    }
    cell.className = "link";
    const a: HTMLAnchorElement = document.createElement("a");
    a.href = column.docs!;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.title = "Documentation";
    const svg: SVGSVGElement = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("viewBox", "0 0 12 16");
    const path: SVGPathElement = document.createElementNS(SVGNS, "path");
    path.setAttribute("fill", "currentColor");
    path.setAttribute("d", ICON_DOCS_PATH_DATA);
    svg.appendChild(path);
    a.appendChild(svg);
    cell.appendChild(a);
}


function row(
    tbody: HTMLTableSectionElement,
    category: string,
    title: string,
    prop: keyof Column,
    categorySpan?: number | null,
    spacedOut: boolean = false
): void {
    const tr: HTMLTableRowElement = tbody.insertRow();
    tr.setAttribute("data-category", category);
    if (categorySpan != null) {
        tr.className = "category-start";
    }
    for (const column of COLUMNS) {
        const td: HTMLTableCellElement = tr.insertCell();
        if (column[prop] == null) {
            continue;
        }
        td.className = "title" in column ? "code" : "example";
        td.innerText = column[prop]!;
        if (spacedOut) {
            td.style.letterSpacing = "0.2em";
        }
    }
    const titleTd: HTMLTableCellElement = tr.insertCell();
    titleTd.className = "title";
    titleTd.innerText = title;
}


function tableHeader(thead: HTMLTableSectionElement): void {
    const tr: HTMLTableRowElement = thead.insertRow();
    for (const column of COLUMNS) {
        const th: HTMLTableCellElement = document.createElement("th");
        if ("title" in column) {
            th.appendChild(document.createTextNode(column.title!));
            if ("subtitle" in column) {
                th.appendChild(document.createElement("br"));
                const subtitle: HTMLSpanElement = document.createElement("span");
                subtitle.className = "subtitle";
                subtitle.innerText = column.subtitle!;
                th.appendChild(subtitle);
            }
        }
        tr.appendChild(th);
    }
    tr.appendChild(document.createElement("th"));
}


function tableBody(tbody: HTMLTableSectionElement): void {
    row(tbody, 'Date', 'Year', 'year', 6);
    row(tbody, 'Date', 'Month', 'month');
    row(tbody, 'Date', 'Month (word)', 'monthFull');
    row(tbody, 'Date', 'Day', 'day');
    row(tbody, 'Date', 'Day of week (word)', 'weekday');
    row(tbody, 'Date', 'Day of Year', 'dayYear');
    row(tbody, 'Time', 'Hour', 'hour', 6);
    row(tbody, 'Time', 'Minute', 'minute');
    row(tbody, 'Time', 'Second', 'second');
    row(tbody, 'Time', 'Millisecond', 'millis');
    row(tbody, 'Time', 'Microsecond', 'micros');
    row(tbody, 'Time', 'Nanosecond', 'nanos');
    row(tbody, 'Timezone', 'Timezone (no colon)', 'tzNoColon', 3);
    row(tbody, 'Timezone', 'Timezone (colon)', 'tzColon');
    row(tbody, 'Timezone', 'Timezone abbr', 'tzAbbr');
    row(tbody, 'Escaping', 'Special characters', 'special', 2, true);
    row(tbody, 'Escaping', 'Escape character(s)', 'esc', null, true);
}


function tableFooter(tfoot: HTMLTableSectionElement): void {
    const tr: HTMLTableRowElement = tfoot.insertRow();
    for (const column of COLUMNS) {
        docsCell(tr.insertCell(), column);
    }
    tr.insertCell();
}


export function buildCheatsheet(parent: HTMLElement): void {
    const container: HTMLDivElement = document.createElement('div');
    container.id = "ma-datetime-table";
    const table: HTMLTableElement = document.createElement('table');
    tableHeader(table.createTHead());
    tableBody(table.createTBody());
    tableFooter(table.createTFoot());
    container.appendChild(table);
    parent.appendChild(container);
}
