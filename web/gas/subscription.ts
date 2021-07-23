import dayjs from "dayjs";

function main() {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const subscriptionsSheet = spreadsheet.getSheetByName("Subscriptions");
    const recordsSheet = spreadsheet.getSheetByName("Records");
    if (!recordsSheet) {
        throw new Error("Not found Records sheet");
    }
    if (!subscriptionsSheet) {
        throw new Error("Not found Subscriptions sheet");
    }
    const table = subscriptionsSheet.getDataRange();
    const values = table.getValues();
    const itemValues = values.slice(1);
    /**
     * @param {Date} date
     * @param {string} to
     * @param {string} amount
     * @param {string} URL
     * @param {string} memo
     */
    const appendRecord = ({
        date,
        to,
        amount,
        URL,
        memo
    }: {
        date: Date;
        to: string;
        amount: string;
        URL: string;
        memo: string;
    }) => {
        console.log("appendRecord", {
            date,
            to,
            amount,
            URL,
            memo
        });
        const gridId = recordsSheet.getSheetId();
        const lastRow = recordsSheet.getLastRow();
        const column = 1; // Change if necessary according to your sheet
        const lastColumn = recordsSheet.getLastColumn();
        const range = recordsSheet.getRange(lastRow, column, 1, lastColumn);
        recordsSheet.appendRow([date.toISOString(), to, amount, URL, memo]);
        // https://stackoverflow.com/questions/58565725/get-appendrow-in-gas-to-copy-border-style
        range.copyFormatToRange(gridId, column, lastColumn, lastRow + 1, lastRow + 1);
    };
    /**
     * @param {number} diff
     * @param {Date} startDate
     * @param {Date} today
     */
    const matchYears = (diff: number, startDate: Date, today: Date) => {
        return dayjs(today).diff(startDate, "year") % diff === 0 && dayjs(today).format("MM-DD") === "01-01";
    };
    /**
     * @param {number} diff
     * @param {Date} startDate
     * @param {Date} today
     */
    const matchMonths = (diff: number, startDate: Date, today: Date) => {
        const todayDay = dayjs(today);
        return (
            todayDay.diff(startDate, "month") % diff === 0 && todayDay.format("DD") === dayjs(startDate).format("DD")
        );
    };
    /**
     * @param {number} diff
     * @param {Date} startDate
     * @param {Date} today
     */
    const matchDays = (diff: number, startDate: Date, today: Date) => {
        const todayDay = dayjs(today);
        return todayDay.diff(startDate, "day") % diff === 0;
    };
    const todayDayjs = dayjs();
    for (const item of itemValues) {
        // [StartDate, EndDate, every, to, URL, amount, why?]
        const [startDate, endDate, every, to, amount, URL, memo] = item;
        const match = every.match(/(\d+) (days|months|years)/);
        if (!match) {
            continue;
        }
        const [, diff, format] = match;
        if (endDate) {
            const endDateDay = dayjs(endDate);
            if (endDateDay.isAfter(todayDayjs) && endDateDay.isSame(todayDayjs)) {
                continue; // skip
            }
        }
        if (format === "years") {
            if (matchYears(diff, new Date(startDate), new Date())) {
                appendRecord({
                    date: new Date(),
                    amount,
                    to,
                    URL,
                    memo
                });
            }
        } else if (format === "months") {
            if (matchMonths(diff, new Date(startDate), new Date())) {
                appendRecord({
                    date: new Date(),
                    amount,
                    to,
                    URL,
                    memo
                });
            }
        } else if (format === "days") {
            if (matchDays(diff, new Date(startDate), new Date())) {
                appendRecord({
                    date: new Date(),
                    amount,
                    to,
                    URL,
                    memo
                });
            }
        }
    }
}

function setTrigger() {
    ScriptApp.newTrigger("main").timeBased().everyDays(1).create();
}
