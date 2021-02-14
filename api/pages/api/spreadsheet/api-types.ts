
// POST /create
export type CreateRequestQuery = {
    token: string;
}
export type CreateRequestBody = {
    budget: number;
}
// POST /add
export type AddRequestQuery = {
    token: string;
    spreadsheetId: string;
}
// GET /get
export type GetRequestQuery = {
    token: string;
    spreadsheetId: string;
}
