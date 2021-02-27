import { NextApiResponse } from "next";
import { google } from "googleapis";
import { validateAddRequestBody } from "./api-types.validator";
import nextConnect from "next-connect";
import { withSession } from "../../../api-utils/with-session";
import { createOAuthClient } from "../../../api-utils/create-OAuth";
import { UserCredentials } from "../../../domain/User";
import dayjs from "dayjs";
import { NextApiRequestWithUserSession, requireLogin } from "../../../api-utils/requireLogin";
import { AddRequestBody } from "./api-types";

const sheets = google.sheets("v4");

export const addItem = async (
    item: AddRequestBody,
    meta: {
        spreadsheetId: string;
        credentials: UserCredentials;
    }
) => {
    const client = createOAuthClient(meta.credentials);
    const { token } = await client.getAccessToken();
    if (!token) {
        throw new Error("No Access Token");
    }
    const nowDate = new Date().toISOString();
    const spreadsheet = await sheets.spreadsheets.get({
        oauth_token: token,
        spreadsheetId: meta.spreadsheetId
    });
    const CURRENT_YEAR = dayjs().format("YYYY");
    const foundSheet = spreadsheet.data.sheets?.find((sheet) => {
        return sheet.properties?.title === CURRENT_YEAR;
    });
    if (!foundSheet) {
        throw new Error("Not found sheet");
    }
    const foundSheetId = foundSheet?.properties?.sheetId;
    return await sheets.spreadsheets.batchUpdate({
        oauth_token: token,
        spreadsheetId: meta.spreadsheetId,
        requestBody: {
            requests: [
                {
                    appendCells: {
                        sheetId: foundSheetId,
                        fields: "*",
                        rows: [
                            {
                                values: [
                                    nowDate,
                                    item.to,
                                    item.amount,
                                    item.url,
                                    item.memo,
                                    JSON.stringify(item.meta ?? {})
                                ].map((v) => {
                                    if (typeof v === "number") {
                                        return {
                                            userEnteredFormat: {
                                                numberFormat: {
                                                    type: "CURRENCY"
                                                }
                                            },
                                            userEnteredValue: {
                                                numberValue: v
                                            }
                                        };
                                    }
                                    return {
                                        userEnteredValue: {
                                            stringValue: v
                                        }
                                    };
                                })
                            }
                        ]
                    }
                }
            ]
        }
    });
};
const handler = nextConnect<NextApiRequestWithUserSession, NextApiResponse>()
    .use(withSession())
    .use(requireLogin())
    .post(async (req, res) => {
        const { amount, memo, to, url, meta } = validateAddRequestBody(req.body);
        const user = req.user;
        await addItem(
            { amount, memo, to, url, meta },
            {
                credentials: user.credentials,
                spreadsheetId: user.spreadsheetId
            }
        );
        const HOST = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://philan-net.vercel.app";
        res.json({
            pageURL: `${HOST}/user/${user.id}`
        });
    });

export default handler;
