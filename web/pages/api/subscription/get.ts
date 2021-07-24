import { google } from "googleapis";
import { SheetTitles } from "../spreadsheet/SpreadSheetSchema";
import { NextApiRequestWithUserSession, requireLogin } from "../../../api-utils/requireLogin";
import { NextApiResponse } from "next";
import { withSession } from "../../../api-utils/with-session";
import nextConnect, { ErrorHandler } from "next-connect";
import { getToken, GetTokenMeta } from "../../../api-utils/oauth/getToken";
import dayjs from "dayjs";
import { parseAmount } from "../../../api-utils/parseAmount";
import { logger } from "../../../api-utils/logger";
import type { GetResponseBody, SubscriptionItem } from "./api-types";

export const getSubscriptionItems = async ({
    spreadsheetId,
    defaultCurrency,
    meta
}: {
    spreadsheetId: string;
    defaultCurrency: string;
    meta: GetTokenMeta;
}): Promise<SubscriptionItem[]> => {
    const sheets = google.sheets("v4");
    const token = await getToken(meta);
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
    const subscriptionSheet = spreadsheet?.data?.sheets?.find((sheet) => {
        return sheet?.properties?.title === SheetTitles.Subscriptions;
    });
    if (!subscriptionSheet) {
        throw new Error(
            "Records Spreadsheet is not found.\n" + "\n" + "Can you rename record spreadsheet to 'Records'?"
        );
    }
    const START_OF_USER_DATA = 1;
    const recordAllCells = subscriptionSheet?.data?.[0].rowData;
    const recordDataCells = recordAllCells?.slice(START_OF_USER_DATA) ?? [];
    const recordItems = recordDataCells
        .filter((row) => {
            const values = row.values;
            const startDate = values?.[0]?.formattedValue;
            return startDate;
        })
        ?.map((row) => {
            const values = row.values;
            const startDate = values?.[0]?.formattedValue!;
            const eneDate = values?.[1]?.formattedValue ?? "";
            const cron = values?.[2]?.userEnteredValue?.stringValue ?? "";
            const to = values?.[3]?.userEnteredValue?.stringValue ?? "";
            const amountUserEnteredValue = values?.[4]?.userEnteredValue?.formulaValue ?? values?.[4]?.formattedValue;
            const amountNumber = values?.[4]?.effectiveValue?.numberValue!;
            const amountFormattedValue = values?.[4]?.formattedValue!;
            const url = values?.[5]?.userEnteredValue?.stringValue ?? "";
            const memo = values?.[6]?.userEnteredValue?.stringValue ?? "";
            const parsedAmount = parseAmount(amountUserEnteredValue ?? amountNumber, defaultCurrency);
            return {
                startDate,
                eneDate,
                cron,
                to,
                amount: {
                    number: amountNumber,
                    value: amountFormattedValue,
                    raw: parsedAmount.amount,
                    inputCurrency: parsedAmount.from,
                    outputCurrency: parsedAmount.to
                },
                url: url,
                memo: memo
            };
        })
        .sort((a, b) => {
            return dayjs(a.startDate).isBefore(b.startDate) ? 1 : -1;
        });
    return recordItems;
};

const onError: ErrorHandler<any, NextApiResponse> = (error, _req, res) => {
    logger.error(error);
    if (process.env.NODE_ENV === "production") {
        res.status(500).end("Server Error");
    } else {
        res.status(500).end(error.stack);
    }
};
const handler = nextConnect<NextApiRequestWithUserSession, NextApiResponse<GetResponseBody>>({ onError })
    .use(withSession())
    .use(requireLogin())
    .get(async (req, res) => {
        const user = req.user;
        if (!user) {
            throw new Error("No user");
        }
        if (!user.appsScriptId) {
            throw new Error("Already created subscription apps and sheet!");
        }
        const items = await getSubscriptionItems({
            spreadsheetId: user.spreadsheetId,
            defaultCurrency: user.defaultCurrency,
            meta: {
                credentials: user.credentials
            }
        });
        res.json({
            items: items
        });
    });
export default handler;
