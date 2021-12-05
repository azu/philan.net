import { NextApiResponse } from "next";
import { google, sheets_v4 } from "googleapis";
import { UserCredentials } from "../../../../domain/User";
import { createOAuthClient } from "../../../../api-utils/create-OAuth";
import nextConnect from "next-connect";
import { withSession } from "../../../../api-utils/with-session";
import { NextApiRequestWithUserSession, requireLogin } from "../../../../api-utils/requireLogin";
import { BudgetItem, GetBudgetResponse } from "./api-types";
import { SheetTitles } from "../SpreadSheetSchema";
import { isBudgetItem } from "./api-types.validator";
type Schema$Sheet = sheets_v4.Schema$Sheet;

const sheets = google.sheets("v4");
export const parseBudgetsFromBudgetsSheet = (budgetsSheet: Schema$Sheet): BudgetItem[] => {
    const START_OF_USER_DATA = 1;
    const recordAllCells = budgetsSheet?.data?.[0].rowData;
    const recordDataCells = recordAllCells?.slice(START_OF_USER_DATA) ?? [];
    return recordDataCells
        .filter((cell) => {
            return cell.values !== undefined;
        })
        .map((cell) => {
            // Year	Budget	Used	Balance
            const [Year, Budget, Used, Balance] = cell.values!;
            return {
                year: Number(Year.userEnteredValue?.stringValue),
                budget: {
                    raw: Budget.effectiveValue?.numberValue,
                    value: Budget.formattedValue
                },
                used: {
                    raw: Used.effectiveValue?.numberValue,
                    value: Used.formattedValue
                },
                balance: {
                    raw: Balance.effectiveValue?.numberValue,
                    value: Balance.formattedValue
                }
            };
        })
        .filter((item) => {
            return isBudgetItem(item);
        }) as BudgetItem[];
};
export const getBudgets = async ({
    spreadsheetId,
    credentials
}: {
    spreadsheetId: string;
    credentials: UserCredentials;
    defaultCurrency: string;
}): Promise<GetBudgetResponse> => {
    const client = createOAuthClient(credentials);
    const { token } = await client.getAccessToken();
    if (!token) {
        throw new Error("No Access Token");
    }
    const spreadsheet = await sheets.spreadsheets.get({
        oauth_token: token,
        spreadsheetId,
        includeGridData: true
    });
    if (!spreadsheet?.data?.sheets) {
        throw new Error("500: No spreadsheet data");
    }
    // const locale = spreadsheet.data.properties?.locale;
    const budgetsSheet = spreadsheet?.data?.sheets?.find((sheet) => {
        return sheet?.properties?.title === SheetTitles.Budgets;
    });
    if (!budgetsSheet) {
        throw new Error(
            "Records Spreadsheet is not found.\n" + "\n" + "Can you rename record spreadsheet to 'Records'?"
        );
    }
    return parseBudgetsFromBudgetsSheet(budgetsSheet);
};

const handler = nextConnect<NextApiRequestWithUserSession, NextApiResponse>()
    .use(withSession())
    .use(requireLogin())
    .get(async (req, res) => {
        const user = req.user;
        const response = await getBudgets({
            credentials: user.credentials,
            spreadsheetId: user.spreadsheetId,
            defaultCurrency: user.defaultCurrency
        });
        res.json(response);
    });

export default handler;
