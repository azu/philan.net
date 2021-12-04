// GET /get
export type GetBudgetResponse = BudgetItem[];
export type BudgetItem = {
    year: number;
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
