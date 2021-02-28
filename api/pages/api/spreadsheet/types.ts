export type RecordItem = {
    date: string;
    to: string;
    amount: number;
    url: string;
    memo: string;
    meta: {
        type: "checking" | "checked" | "not-money";
    };
};
