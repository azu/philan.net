export type RecordItem = {
    date: string;
    to: string;
    amount: number;
    url: string;
    memo: string;
    meta: {
        type: "checking" | "checked";
    };
};
export type RowLineTypes = [
    string: "Date",
    string: "To",
    string: "Amount",
    string: "URL",
    string: "Memo",
    object: "Meta"
];
