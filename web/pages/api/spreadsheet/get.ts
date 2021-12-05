import { NextApiResponse } from "next";
import { google } from "googleapis";
import { UserCredentials } from "../../../domain/User";
import { createOAuthClient } from "../../../api-utils/create-OAuth";
import nextConnect from "next-connect";
import { withSession } from "../../../api-utils/with-session";
import { NextApiRequestWithUserSession, requireLogin } from "../../../api-utils/requireLogin";
import dayjs from "dayjs";
import { createItemId } from "../../../api-utils/create-item-id";
import { GetResponseBody } from "./api-types";
import groupBy from "lodash/groupBy";
import { SheetTitles } from "./SpreadSheetSchema";
import { parseBudgetsFromBudgetsSheet } from "./budget/get";

const sheets = google.sheets("v4");

const parseAmount = (amount: string | number, defaultCurrency: string) => {
    if (amount === undefined) {
        throw new Error("amount is undefined. Please check your spreadsheet");
    }
    if (typeof amount === "number") {
        return {
            amount,
            from: defaultCurrency,
            to: defaultCurrency
        };
    }
    // = ${v} * index(GOOGLEFINANCE("CURRENCY:${item.currency.from}${item.currency.to}", "price", "${date}"), 2, 2);
    if (amount.startsWith("=")) {
        const match = amount.match(
            /=\s*(?<AMOUNT>\d+)\s*\*\s*index\(GOOGLEFINANCE\("CURRENCY:(?<FROM>\w{3})(?<TO>\w{3})/
        );
        if (!match) {
            return {
                amount: 0,
                from: defaultCurrency,
                to: defaultCurrency
            };
        }
        return {
            amount: Number(match.groups?.AMOUNT!),
            from: match.groups?.FROM!,
            to: match.groups?.TO!
        };
    } else {
        return {
            amount: Number(amount),
            from: defaultCurrency,
            to: defaultCurrency
        };
    }
};
export const getSpreadSheet = async ({
    spreadsheetId,
    credentials,
    defaultCurrency
}: {
    spreadsheetId: string;
    credentials: UserCredentials;
    defaultCurrency: string;
}): Promise<GetResponseBody> => {
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
    const START_OF_USER_DATA = 3;
    if (!spreadsheet?.data?.sheets) {
        throw new Error("500: No spreadsheet data");
    }
    // const locale = spreadsheet.data.properties?.locale;
    const recordSheet = spreadsheet?.data?.sheets?.find((sheet) => {
        // TODO: OLD_Records is for backward-compatible
        return sheet?.properties?.title === SheetTitles.Records || sheet?.properties?.title === SheetTitles.OLD_Records;
    });
    const budgetsSheet = spreadsheet?.data?.sheets?.find((sheet) => {
        return sheet?.properties?.title === SheetTitles.Budgets;
    });
    if (!recordSheet) {
        throw new Error(
            "Records Spreadsheet is not found.\n" + "\n" + "Your spreadsheet does not have 'Records' sheet"
        );
    }
    if (!budgetsSheet) {
        throw new Error(
            "Budgets Spreadsheet is not found.\n" + "\n" + "Your spreadsheet does not have 'Budgets' sheet?"
        );
    }
    const recordAllCells = recordSheet?.data?.[0].rowData;
    const recordDataCells = recordAllCells?.slice(START_OF_USER_DATA) ?? [];
    const recordItems = recordDataCells
        .filter((row) => {
            const values = row.values;
            return (
                values?.[0].userEnteredValue?.stringValue &&
                values?.[1].userEnteredValue?.stringValue &&
                values?.[2]?.formattedValue!
            );
        })
        ?.map((row) => {
            const values = row.values;
            const dateString = values?.[0]?.userEnteredValue?.stringValue!;
            const amountUserEnteredValue = values?.[2]?.userEnteredValue?.formulaValue;
            const amountNumber = values?.[2]?.effectiveValue?.numberValue!;
            const amountFormattedValue = values?.[2]?.formattedValue!;
            const url = values?.[3]?.userEnteredValue?.stringValue!;
            const id = createItemId({
                dateString,
                amountNumber,
                url
            });
            const meta = JSON.parse(values?.[5]?.userEnteredValue?.stringValue ?? "{}");
            const parsedAmount = parseAmount(amountUserEnteredValue ?? amountNumber, defaultCurrency);
            return {
                id,
                date: dateString,
                to: values?.[1].userEnteredValue?.stringValue!,
                amount: {
                    number: amountNumber,
                    value: amountFormattedValue,
                    raw: parsedAmount.amount,
                    inputCurrency: parsedAmount.from,
                    outputCurrency: parsedAmount.to
                },
                url: url ?? "",
                memo: values?.[4].userEnteredValue?.stringValue ?? "",
                meta: meta
            };
        })
        .sort((a, b) => {
            return dayjs(a.date).isBefore(b.date) ? 1 : -1;
        });
    const statsRow = recordAllCells?.[1];
    if (!statsRow) {
        throw new Error("statsRow is not defined");
    }
    const README = statsRow?.values?.[3]?.formattedValue! ?? "";
    const budgets = parseBudgetsFromBudgetsSheet(budgetsSheet);
    const matchBudget = (year: number) => {
        const matchedBudget = budgets.find((budget) => budget.year === year);
        if (matchedBudget) {
            return matchedBudget;
        }
        return {
            year: year,
            budget: {
                raw: 0,
                value: "None"
            },
            used: {
                raw: 0,
                value: "None"
            },
            balance: {
                raw: 0,
                value: "None"
            }
        };
    };
    if (recordItems.length === 0) {
        const currentYear = dayjs().format("YYYY");
        const budget = matchBudget(Number(currentYear));
        return [
            {
                year: currentYear,
                stats: budget,
                README,
                items: []
            }
        ];
    }
    const itemsByYear = groupBy(recordItems, (item) => dayjs(item.date).format("YYYY"));
    // 2021, 2020 ....
    return Object.keys(itemsByYear)
        .sort((a, b) => Number(b) - Number(a))
        .map((year) => {
            const budget = matchBudget(Number(year));
            return {
                year,
                stats: budget,
                README,
                items: itemsByYear[year]
            };
        });
};

const handler = nextConnect<NextApiRequestWithUserSession, NextApiResponse>()
    .use(withSession())
    .use(requireLogin())
    .get(async (req, res) => {
        const user = req.user;
        const response = await getSpreadSheet({
            credentials: user.credentials,
            spreadsheetId: user.spreadsheetId,
            defaultCurrency: user.defaultCurrency
        });
        res.json(response);
    });

export default handler;
