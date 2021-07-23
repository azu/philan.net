import { createRecord } from "./subscription";
import dayjs from "dayjs";
import * as assert from "assert";

const to = "test";
const URL = "https://example.test";
const amount = "100";
const memo = "memo";

describe("createRecord", function () {
    it("should create when match every day", () => {
        const today = new Date();
        // [StartDate, EndDate, cron, to, URL, amount, why?]
        const startDate = dayjs().subtract(1, "day").toDate();
        const endDate = undefined;
        const everyDayCron = "0 0 * * *";
        const result = createRecord(today, [startDate, endDate, everyDayCron, to, URL, amount, memo]);
        assert.strictEqual(result.type, "created");
        if (result.type === "created") {
            assert.ok(dayjs(today).isSame(result.record.date, "day"));
        }
    });
    it("should create when match every month 1st", () => {
        const firstDayOfMonth = dayjs().startOf("month").toDate();
        // [StartDate, EndDate, cron, to, URL, amount, why?]
        const startDate = dayjs().subtract(1, "month").toDate();
        const endDate = undefined;
        const everyMonthCron = "0 0 1 * *";
        const result = createRecord(firstDayOfMonth, [startDate, endDate, everyMonthCron, to, URL, amount, memo]);
        assert.strictEqual(result.type, "created");
        if (result.type === "created") {
            assert.ok(dayjs(firstDayOfMonth).isSame(result.record.date, "day"));
        }
    });
    it("should create when match every year 1/1", () => {
        // 1/1
        const firstDayOfYear = dayjs().startOf("year").startOf("month").toDate();
        // [StartDate, EndDate, cron, to, URL, amount, why?]
        const startDate = dayjs().subtract(1, "year").toDate();
        const endDate = undefined;
        const everyYearCron = "0 0 1 1 *";
        const result = createRecord(firstDayOfYear, [startDate, endDate, everyYearCron, to, URL, amount, memo]);
        assert.strictEqual(result.type, "created");
        if (result.type === "created") {
            assert.ok(dayjs(firstDayOfYear).isSame(result.record.date, "day"));
        }
    });
    it("should not create when match every month 1st, but today is 2nd day of the month", () => {
        const secondDayOfMonth = dayjs().startOf("month").add(1, "day").toDate();
        // [StartDate, EndDate, cron, to, URL, amount, why?]
        const startDate = dayjs().subtract(1, "month").toDate();
        const endDate = undefined;
        const everyMonthCron = "0 0 1 * *";
        const result = createRecord(secondDayOfMonth, [startDate, endDate, everyMonthCron, to, URL, amount, memo]);
        assert.strictEqual(result.type, "no-create");
    });
    it("should not create when match every 15th of month, but today is 1st day of the month", () => {
        const secondDayOfMonth = dayjs().startOf("month").toDate();
        // [StartDate, EndDate, cron, to, URL, amount, why?]
        const startDate = dayjs().subtract(1, "month").toDate();
        const endDate = undefined;
        const everyMonthCron = "0 0 15 * *";
        const result = createRecord(secondDayOfMonth, [startDate, endDate, everyMonthCron, to, URL, amount, memo]);
        assert.strictEqual(result.type, "no-create");
    });
});
