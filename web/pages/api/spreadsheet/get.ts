import { NextApiResponse } from "next";
import { google } from "googleapis";
import { UserCredentials } from "../../../domain/User";
import { createOAuthClient } from "../../../api-utils/create-OAuth";
import nextConnect from "next-connect";
import { withSession } from "../../../api-utils/with-session";
import { NextApiRequestWithUserSession, requireLogin } from "../../../api-utils/requireLogin";
import dayjs from "dayjs";
import shortHash from "shorthash2";
const sheets = google.sheets("v4");

const createHashedId = (...seeds: (string | undefined)[]) => {
    const stringSeeds = seeds.filter((seed) => seed !== undefined || seed !== null) as string[];
    return shortHash(stringSeeds.join("--"));
};
export const getSpreadSheet = async ({
    spreadsheetId,
    credentials
}: {
    spreadsheetId: string;
    credentials: UserCredentials;
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
                    const amountValue = values?.[2]?.formattedValue!;
                    const dateKey = dayjs(dateString!).format("YYYY-MM-DD");
                    const url = values?.[3].userEnteredValue?.stringValue!;
                    const hashId = createHashedId(dateString, amountValue, url);
                    const id = `${dateKey}-${hashId}`;
                    const meta = JSON.parse(values?.[5]?.userEnteredValue?.stringValue ?? "{}");
                    return {
                        id,
                        date: dateString,
                        to: values?.[1].userEnteredValue?.stringValue!,
                        amount: {
                            raw: values?.[2].effectiveValue?.numberValue!,
                            value: amountValue
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
    .post(async (req, res) => {
        const user = req.user;
        const response = await getSpreadSheet({
            credentials: user.credentials,
            spreadsheetId: user.spreadsheetId
        });
        res.json(response);
    });

export default handler;
