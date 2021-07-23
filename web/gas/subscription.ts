import dayjs from "dayjs";
import cronParser from "cron-parser";

// Subscription tab data
type SubscriptionRowItem = [
    startDate: Date,
    enDate: Date | undefined,
    every: string,
    to: string,
    URL: string,
    amount: string,
    memo: string
];
// To add record
type SubscriptionRecord = {
    date: Date;
    to: string;
    amount: string;
    URL: string;
    memo: string;
};
export type CreateRecordResult =
    | {
          type: "error";
          message: string;
      }
    | {
          type: "no-create";
          message: string;
      }
    | {
          type: "created";
          record: SubscriptionRecord;
      };
export const createRecord = (today: Date, item: SubscriptionRowItem): CreateRecordResult => {
    // [StartDate, EndDate, cron, to, URL, amount, why?]
    const [startDate, endDate, cron, to, amount, URL, memo] = item;
    try {
        const interval = cronParser.parseExpression(cron, {
            startDate: startDate,
            // end of yesterday → found date in today
            currentDate: dayjs(today).startOf("day").subtract(1, "second").toDate(),
            endDate: endDate
        });
        if (!interval.hasNext()) {
            return {
                type: "no-create",
                message: "No next date."
            };
        }
        const nextDate = interval.next();
        if (!nextDate) {
            return {
                type: "no-create",
                message: "No next date."
            };
        }
        // if today is matched, should create it as record
        if (dayjs(nextDate.toDate()).isSame(dayjs(today), "day")) {
            return {
                type: "created",
                record: {
                    date: today,
                    amount,
                    to,
                    URL,
                    memo
                }
            };
        } else {
            return {
                type: "no-create",
                message: "No match date"
            };
        }
    } catch (error: any) {
        return {
            type: "error",
            message: `Invalid cron format: ${cron}. ${error.message}`
        };
    }
};

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
    const appendRecord = ({ date, to, amount, URL, memo }: SubscriptionRecord) => {
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
    const todayDay = new Date();
    for (const item of itemValues) {
        const result = createRecord(todayDay, item as SubscriptionRowItem);
        if (result.type === "no-create") {
            console.log(`No create on ${JSON.stringify(item)}: ${result.message}`);
        } else if (result.type === "error") {
            console.error(`Error on  ${JSON.stringify(item)}: ${result.message}`);
        } else {
            const record = result.record;
            console.log(`Append record on ${JSON.stringify(item)}: ${JSON.stringify(record)}`);
            appendRecord(record);
        }
    }
}

function setTrigger() {
    ScriptApp.newTrigger("main").timeBased().everyDays(1).create();
}
