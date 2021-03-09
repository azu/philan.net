export type RecordItem = {
    date: string;
    to: string;
    amount: number;
    url: string;
    memo: string;
    meta: {
        id: string;
        type: "checking" | "checked" | "not-money";
    };
};
