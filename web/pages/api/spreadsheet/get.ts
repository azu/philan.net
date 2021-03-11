import { NextApiResponse } from "next";
import { google } from "googleapis";
import { UserCredentials } from "../../../domain/User";
import { createOAuthClient } from "../../../api-utils/create-OAuth";
import nextConnect from "next-connect";
import { withSession } from "../../../api-utils/with-session";
import { NextApiRequestWithUserSession, requireLogin } from "../../../api-utils/requireLogin";
import dayjs from "dayjs";
import { createItemId } from "../../../api-utils/create-item-id";

const sheets = google.sheets("v4");

const parseAmount = (amount: string | number, defaultCurrency: string) => {
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
            amount: amount,
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
}) => {
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
    return spreadsheet?.data?.sheets?.map((sheet) => {
        const items = sheet?.data?.[0];
        // ["Budget", "Used", "Balance"]
        const statsRow = items?.rowData?.[1];
        const rowDate = items?.rowData?.slice(START_OF_USER_DATA) ?? [];
        return {
            year: sheet?.properties?.title!,
            README: statsRow?.values?.[3]?.formattedValue! ?? "",
            stats: {
                budget: {
                    raw: statsRow?.values?.[0]?.effectiveValue?.numberValue!,
                    value: statsRow?.values?.[0]?.formattedValue!
                },
                used: {
                    raw: statsRow?.values?.[1]?.effectiveValue?.numberValue!,
                    value: statsRow?.values?.[1]?.formattedValue!
                },
                balance: {
                    raw: statsRow?.values?.[2]?.effectiveValue?.numberValue!,
                    value: statsRow?.values?.[2]?.formattedValue!
                }
            },
            items: rowDate
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
                    const dateString = values?.[0].userEnteredValue?.stringValue!;
                    const amountUserEnteredValue = values?.[2].userEnteredValue?.formulaValue!;
                    const amountNumber = values?.[2].effectiveValue?.numberValue!;
                    const amountFormattedValue = values?.[2]?.formattedValue!;
                    const url = values?.[3].userEnteredValue?.stringValue!;
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
                        url: url,
                        memo: values?.[4].userEnteredValue?.stringValue ?? "",
                        meta: meta
                    };
                })
                .sort((a, b) => {
                    return dayjs(a.date).isBefore(b.date) ? 1 : -1;
                })
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
