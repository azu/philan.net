// POST /create
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
export type AddRequestBody = {
    to: string;
    amount: number;
    url: string;
    memo: string;
};
// GET /get
export type GetRequestQuery = {
    token: string;
    spreadsheetId: string;
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
    items: {
        date: string;
        to: string;
        amount: {
            raw: number;
            value: string;
        };
        url: string;
        memo: string;
    }[];
}[];
