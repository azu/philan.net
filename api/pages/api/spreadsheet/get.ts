import { NextApiResponse } from "next";
import { google } from "googleapis";
import { UserCredentials } from "../../../domain/User";
import { createOAuthClient } from "../../../api-utils/create-OAuth";
import nextConnect from "next-connect";
import { withSession } from "../../../api-utils/with-session";
import { NextApiRequestWithUserSession, requireLogin } from "../../../api-utils/requireLogin";

const sheets = google.sheets("v4");
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
    return spreadsheet?.data?.sheets?.map((sheet) => {
        const items = sheet?.data?.[0];
        // ["Budget", "Used", "Balance"]
        const statsRow = items?.rowData?.[1];
        const rowDate = items?.rowData?.slice(START_OF_USER_DATA) ?? [];
        return {
            year: sheet?.properties?.title!,
            README: statsRow?.values?.[3]?.formattedValue!,
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
                    return {
                        date: values?.[0].userEnteredValue?.stringValue!,
                        to: values?.[1].userEnteredValue?.stringValue!,
                        amount: {
                            raw: values?.[2].userEnteredValue?.numberValue!,
                            value: values?.[2]?.formattedValue!
                        },
                        url: values?.[3].userEnteredValue?.stringValue!,
                        memo: values?.[4].userEnteredValue?.stringValue ?? ""
                    };
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
