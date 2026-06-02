export interface LocalizedDate {
    jsdate: Date;
    date: [number, number, number];
    time: [number, number, number, number];
    tz: [number, number];
}


export function localizeDate(date?: Date, tz?: [number, number]): LocalizedDate {
    if (date == null) {
        date = new Date();
    }
    if (tz == null) {
        let offset: number = date.getTimezoneOffset();
        const sign: number = -Math.sign(offset);
        offset = Math.abs(offset);
        tz = [sign * Math.floor(offset / 60), offset % 60];
    }
    return {
        jsdate: date,
        date: [date.getFullYear(), date.getMonth() + 1, date.getDate()],
        time: [
            date.getHours(), date.getMinutes(), date.getSeconds(),
            date.getMilliseconds() * 1000000
        ],
        tz: tz
    };
}


export function localizedDay(year: number, month: number, day: number): LocalizedDate {
    return {
        jsdate: new Date(year, month - 1, day),
        date: [year, month, day], time: [0, 0, 0, 0], tz: [0, 0]
    };
}
