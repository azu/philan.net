// POST /create
import { RecordItem } from "./types";

export type CreateRequestQuery = {
    token: string;
};
export type CreateRequestBody = {
    budget: number;
};
// POST /add
export type AddRequestQuery = {
    token: string;
    spreadsheetId: string;
};
export type AddRequestBody = Omit<RecordItem, "date"> & {
    isoDate: string; // iso date
    currency: string;
};
export type AddResponseBody = {
    ok: true;
};
// GET /get
export type GetRequestQuery = {
    token: string;
    spreadsheetId: string;
};
export type SpreadSheetItem = {
    id: string;
    date: string;
    to: string;
    amount: {
        number: number;
        value: string;
        raw: number;
        inputCurrency: string;
        outputCurrency: string;
    };
    url: string;
    memo: string; // why?
    meta: Omit<RecordItem["meta"], "id">;
};
export type GetResponseBody = {
    year: string;
    README: string;
    stats: {
        budget: {
            raw: number;
            value: string;
        };
        used: {
            raw: number;
            value: string;
        };
        balance: {
            raw: number;
            value: string;
        };
    };
    items: SpreadSheetItem[];
}[];
