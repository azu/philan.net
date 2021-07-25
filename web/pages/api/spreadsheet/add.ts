import { NextApiResponse } from "next";
import { google } from "googleapis";
import { validateAddRequestBody } from "./api-types.validator";
import nextConnect from "next-connect";
import { withSession } from "../../../api-utils/with-session";
import { createOAuthClient } from "../../../api-utils/oauth/createOAuthClient";
import { UserCredentials } from "../../../domain/User";
import dayjs from "dayjs";
import { NextApiRequestWithUserSession, requireLogin } from "../../../api-utils/requireLogin";
import { RecordItem } from "./types";
import { SheetTitles } from "./SpreadSheetSchema";
import { createAmountFormula } from "../../../api-utils/amount-util";

const sheets = google.sheets("v4");

export const addItem = async (
    item: RecordItem & {
        currency: {
            from: string;
            to: string;
        };
    },
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
    const spreadsheet = await sheets.spreadsheets.get({
        oauth_token: token,
        spreadsheetId: meta.spreadsheetId
    });
    const foundSheet = spreadsheet.data.sheets?.find((sheet) => {
        return sheet.properties?.title === SheetTitles.Records || sheet.properties?.title === SheetTitles.OLD_Records;
    });
    if (!foundSheet) {
        throw new Error("Not found sheet");
    }
    const foundSheetId = foundSheet?.properties?.sheetId;
    // TODO: use append is atomic
    // batchUpdate is not atomic
    // https://groups.google.com/g/google-spreadsheets-api/c/G0sUsBHlaZg
    return sheets.spreadsheets.batchUpdate({
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
                                    item.date,
                                    item.to,
                                    item.amount,
                                    item.url,
                                    item.memo,
                                    JSON.stringify(item.meta ?? {})
                                ].map((v) => {
                                    if (typeof v === "number") {
                                        const shouldTransformCurrency = item.currency.from !== item.currency.to;
                                        if (shouldTransformCurrency) {
                                            const value = createAmountFormula({
                                                date: dayjs(item.date).toDate(),
                                                value: v,
                                                currency: item.currency
                                            });
                                            return {
                                                userEnteredFormat: {
                                                    numberFormat: {
                                                        type: "CURRENCY"
                                                    }
                                                },
                                                userEnteredValue: {
                                                    formulaValue: value
                                                }
                                            };
                                        } else {
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
        const { isoDate, amount, memo, to, url, currency, meta } = validateAddRequestBody(req.body);
        const user = req.user;
        const date = isoDate ?? new Date().toISOString();
        await addItem(
            {
                date,
                amount,
                memo,
                to,
                url,
                currency: {
                    from: currency,
                    to: user.defaultCurrency
                },
                meta
            },
            {
                credentials: user.credentials,
                spreadsheetId: user.spreadsheetId
            }
        );
        res.json({
            ok: true
        });
    });

export default handler;
