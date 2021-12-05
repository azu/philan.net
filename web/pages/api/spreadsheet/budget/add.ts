import { NextApiResponse } from "next";
import { google } from "googleapis";
import { UserCredentials } from "../../../../domain/User";
import { createOAuthClient } from "../../../../api-utils/create-OAuth";
import nextConnect from "next-connect";
import { withSession } from "../../../../api-utils/with-session";
import { NextApiRequestWithUserSession, requireLogin } from "../../../../api-utils/requireLogin";
import { AddBudgetRequest, AddBudgetResponse } from "./api-types";
import { SheetTitles } from "../SpreadSheetSchema";
import { createRow } from "../../../../api-utils/spreadsheet-util";
import { validateAddBudgetRequest } from "./api-types.validator";

const sheets = google.sheets("v4");
export const addBudget = async ({
    year,
    budgetValue,
    spreadsheetId,
    credentials
}: {
    year: number;
    budgetValue: number;
    spreadsheetId: string;
    credentials: UserCredentials;
    defaultCurrency: string;
}) => {
    const client = createOAuthClient(credentials);
    const { token } = await client.getAccessToken();
    if (!token) {
        throw new Error("No Access Token");
    }
    const spreadsheet = await sheets.spreadsheets.get({
        oauth_token: token,
        spreadsheetId: spreadsheetId
    });
    const foundSheet = spreadsheet.data.sheets?.find((sheet) => {
        return sheet.properties?.title === SheetTitles.Budgets;
    });
    if (!foundSheet) {
        throw new Error("Not found sheet");
    }
    const foundSheetId = foundSheet?.properties?.sheetId;
    const BudgetRowData = [
        [
            String(year),
            budgetValue,
            `=SUMIFS('${SheetTitles.Records}'!C:C,'${SheetTitles.Records}'!A:A,INDIRECT(ADDRESS(ROW(),COLUMN()-2))&"-*")`,
            "=INDIRECT(ADDRESS(ROW(),COLUMN()-2))-INDIRECT(ADDRESS(ROW(),COLUMN()-1))"
        ]
    ] as (string | number)[][];
    return sheets.spreadsheets.batchUpdate({
        oauth_token: token,
        spreadsheetId: spreadsheetId,
        requestBody: {
            requests: [
                {
                    appendCells: {
                        sheetId: foundSheetId,
                        fields: "*",
                        rows: createRow(BudgetRowData)
                    }
                }
            ]
        }
    });
};

const handler = nextConnect<NextApiRequestWithUserSession & AddBudgetRequest, NextApiResponse & AddBudgetResponse>({
    onError: (err, _req, res) => {
        console.error(err.stack);
        res.status(500).end("Something broke!");
    }
})
    .use(withSession())
    .use(requireLogin())
    .post(async (req, res) => {
        const user = req.user;
        const { year, budget } = validateAddBudgetRequest(req.body);
        const response = await addBudget({
            year,
            budgetValue: budget,
            credentials: user.credentials,
            spreadsheetId: user.spreadsheetId,
            defaultCurrency: user.defaultCurrency
        });
        res.json(response);
    });

export default handler;
