// user=<id>/year=<year>/stats.json
// user=<id>/year=<year>/items.json
import { GetResponseBody } from "../pages/api/spreadsheet/api-types";
import dayjs from "dayjs";
import { RecordItem } from "../pages/api/spreadsheet/types";
import { User } from "../domain/User";

export type StatsJSON = {
    year: string;
    user_id: string;
    user_name: string;
    currency: string;
    budget: number;
    used: number;
    balance: number;
    item_count: number;
};
export type ItemsJSON = {
    year: string;
    user_id: string;
    user_name: string;
    id: string;
    date: string;
    to: string;
    amount: number;
    currency: string;
    url: string;
    memo: string; // why?
    meta: Omit<RecordItem["meta"], "id">;
};

export const createS3StatsNDJSON = ({
    user,
    responseData,
    year = dayjs().format("YYYY")
}: {
    user: User;
    responseData: GetResponseBody;
    year?: string;
}): string | undefined => {
    const targetYear = responseData.find((data) => data.year === year);
    if (!targetYear) {
        return;
    }
    const stats: StatsJSON = {
        year: targetYear.year,
        user_id: user.id,
        user_name: user.name,
        currency: user.defaultCurrency,
        balance: targetYear.stats.balance.raw,
        budget: targetYear.stats.budget.raw,
        used: targetYear.stats.used.raw,
        item_count: targetYear.items.length
    };
    return JSON.stringify(stats);
};

export const crateS3EventItemsNDJSON = ({
    user,
    responseData,
    year = dayjs().format("YYYY")
}: {
    user: User;
    responseData: GetResponseBody;
    year?: string;
}): string | undefined => {
    const targetYear = responseData.find((data) => data.year === year);
    if (!targetYear) {
        return;
    }
    return targetYear.items
        .map((item) => {
            const value: ItemsJSON = {
                year: targetYear.year,
                user_id: user.id,
                user_name: user.name,
                id: item.id,
                amount: item.amount.number,
                currency: item.amount.outputCurrency,
                date: item.date,
                memo: item.memo,
                to: item.to,
                url: item.url,
                meta: item.meta
            };
            return JSON.stringify(value);
        })
        .join("\n");
};
