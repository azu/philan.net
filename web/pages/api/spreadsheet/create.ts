import { NextApiResponse } from "next";
import { google } from "googleapis";
import nextConnect from "next-connect";
import { withSession } from "../../../api-utils/with-session";
import { validateCreateUserRequestBody } from "../user/api-types.validator";
import { createOAuthClient } from "../../../api-utils/create-OAuth";
import { UserCredentials } from "../../../domain/User";
import { NextApiRequestWithUserSession, requireLogin } from "../../../api-utils/requireLogin";
import dayjs from "dayjs";
import { createRow } from "../../../api-utils/spreadsheet-util";
import { SheetTitles } from "./SpreadSheetSchema";
import { env } from "../../../api-utils/env";

const isLocalDebug = env.FORCE_NO_USE_CF;
export const createNewSheet = async (
    { budget, README }: { budget: number; README: string },
    meta: {
        credentials: UserCredentials;
    }
) => {
    const client = createOAuthClient(meta.credentials);
    const { token } = await client.getAccessToken();
    if (!token) {
        throw new Error("No Access Token");
    }
    const title = isLocalDebug ? `philan.net - DEBUG @ ${new Date().toISOString()}` : `philan.net`;
    const CURRENT_YEAR = dayjs().format("YYYY");
    const BudgetRowData = [
        ["Year", "Budget", "Used", "Balance"],
        [
            CURRENT_YEAR,
            budget,
            `=SUMIFS('${SheetTitles.Records}'!C:C,'${SheetTitles.Records}'!A:A,INDIRECT(ADDRESS(ROW(),COLUMN() - 2))&"-*")`,
            "=INDIRECT(ADDRESS(ROW(),COLUMN() - 2))-INDIRECT(ADDRESS(ROW(),COLUMN() - 1))"
        ]
    ] as (string | number)[][];
    const RecordRowData = [
        [`="Budget("&YEAR(TODAY())&")"`, `="Used("&YEAR(TODAY())&")"`, `="Balance("&YEAR(TODAY())&")"`, "README"],
        [
            `=IFERROR(Index(QUERY(${SheetTitles.Budgets}!A:B, "select * where A = '"&YEAR(TODAY())&"'", 0),1,2), 0)`,
            `=SUMIFS(C:C,A:A, YEAR(TODAY())&"-*")`,
            "=A2-B2",
            README
        ],
        ["Date", "To", "Amount", "URL", "Why?", "Meta"]
    ] as (string | number)[][];
    return sheets.spreadsheets.create({
        oauth_token: token,
        requestBody: {
            properties: {
                title: title,
                defaultFormat: {
                    numberFormat: {
                        type: "CURRENCY"
                    }
                }
            },
            // Order
            sheets: [
                // "Records" Sheet
                {
                    properties: {
                        title: SheetTitles.Records,
                        gridProperties: {
                            // fixed
                            frozenRowCount: 3
                        }
                    },
                    data: [
                        {
                            rowData: createRow(RecordRowData)
                        }
                    ]
                },
                // "Budgets" Sheet
                {
                    properties: {
                        title: SheetTitles.Budgets,
                        gridProperties: {
                            // fixed
                            frozenRowCount: 1
                        }
                    },
                    data: [
                        {
                            rowData: createRow(BudgetRowData)
                        }
                    ]
                }
            ]
        }
    });
};

const sheets = google.sheets("v4");

const handler = nextConnect<NextApiRequestWithUserSession, NextApiResponse>()
    .use(withSession())
    .use(requireLogin())
    .get(async (req, res) => {
        const { budget, README } = validateCreateUserRequestBody(req.body);
        const user = req.user;
        if (!user) {
            throw new Error("No user");
        }
        const responseNewSheet = await createNewSheet(
            {
                budget,
                README
            },
            {
                credentials: user.credentials
            }
        );
        res.json({
            spreadsheetId: responseNewSheet.data.spreadsheetId
        });
    });
export default handler;
