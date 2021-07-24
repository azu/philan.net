// POST /add-subsction
export type AddSubscritionRequestBody = {
    startDate: string;
    cron: string;
    to: string;
    amount: number;
    url: string;
    memo: string;
};

export type AddSubscritionResponseody = {
    ok: boolean;
};

// GET /get
export type SubScriptionGetRequestQuery = {};
export type SubScriptionGetResponseBody = {
    items: SubscriptionItem[];
};
export type SubscriptionItem = {
    startDate: string;
    endDate?: string;
    cron: string;
    to: string;
    amount: {
        number: number;
        value: string;
        raw: number;
        inputCurrency: string;
        outputCurrency: string;
    };
    url: string;
    memo: string;
};
