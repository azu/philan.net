import { google } from "googleapis";
import { SheetTitles } from "../../spreadsheet/SpreadSheetSchema";
import { NextApiRequestWithUserSession, requireLogin } from "../../../../api-utils/requireLogin";
import { NextApiResponse } from "next";
import { withSession } from "../../../../api-utils/with-session";
import nextConnect, { ErrorHandler } from "next-connect";
import { logger } from "../../../../api-utils/logger";
import { getToken, GetTokenMeta } from "../../../../api-utils/oauth/getToken";

export const createSubscriptionSheet = async (spreadsheetId: string, meta: GetTokenMeta) => {
    const sheets = google.sheets("v4");
    const token = await getToken(meta);
    const spreadsheet = await sheets.spreadsheets.get({
        oauth_token: token,
        spreadsheetId: spreadsheetId,
        includeGridData: false
    });
    const subscriptionSheet = spreadsheet.data.sheets?.find((sheet) => {
        return sheet.properties?.title === SheetTitles.Subscriptions;
    });
    if (!subscriptionSheet) {
        return;
    }
    const sheetId = subscriptionSheet?.properties?.sheetId;
    if (!sheetId) {
        return;
    }
    // TODO: correct work?
    await sheets.spreadsheets.batchUpdate({
        oauth_token: token,
        spreadsheetId: spreadsheetId,
        fields: "*",
        requestBody: {
            requests: [
                {
                    repeatCell: {
                        fields: "userEnteredFormat.numberFormat",
                        range: {
                            startRowIndex: 1,
                            startColumnIndex: 0,
                            endRowIndex: 3,
                            endColumnIndex: 3,
                            sheetId: sheetId
                        },
                        cell: {
                            userEnteredFormat: {
                                numberFormat: {
                                    type: "DATE",
                                    pattern: "yyyy-mm-dd"
                                },
                                horizontalAlignment: "RIGHT"
                            }
                        }
                    }
                }
            ]
        }
    });
};

const onError: ErrorHandler<any, NextApiResponse> = (error, req, res) => {
    logger.error(error);
    if (process.env.NODE_ENV === "production") {
        res.status(500).end("Server Error");
    } else {
        res.status(500).end(error.stack);
    }
};

const handler = nextConnect<NextApiRequestWithUserSession, NextApiResponse>({ onError })
    .use(withSession())
    .use(requireLogin())
    .post(async (req, res) => {
        const user = req.user;
        if (!user) {
            throw new Error("No user");
        }
        await createSubscriptionSheet(user.spreadsheetId, {
            credentials: user.credentials
        });
        res.json({
            ok: true
        });
    });
export default handler;
