import { google } from "googleapis";
import { SheetTitles } from "../../spreadsheet/SpreadSheetSchema";
import { createRow } from "../../../../api-utils/spreadsheet-util";
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
    const hasSubscription = spreadsheet.data.sheets?.find((sheet) => {
        return sheet.properties?.title === SheetTitles.Subscriptions;
    });
    if (hasSubscription) {
        return;
    }
    // create "Subscription" sheet
    const createSubscriptionSheetResponse = await sheets.spreadsheets.batchUpdate({
        oauth_token: token,
        spreadsheetId: spreadsheetId,
        fields: "*",
        requestBody: {
            includeSpreadsheetInResponse: true, // response includes sheet.id
            requests: [
                {
                    addSheet: {
                        properties: {
                            title: SheetTitles.Subscriptions,
                            gridProperties: {
                                frozenRowCount: 1
                            }
                        }
                    }
                }
            ]
        }
    });
    const subscriptionSheet = createSubscriptionSheetResponse?.data?.updatedSpreadsheet?.sheets?.find((sheet) => {
        return sheet.properties?.title === SheetTitles.Subscriptions;
    });
    const subscriptionSheetId = subscriptionSheet?.properties?.sheetId;
    if (!subscriptionSheetId) {
        throw new Error("Fail to create subscription sheet");
    }
    logger.info(`subscriptionSheetId: ${subscriptionSheetId}`);
    await sheets.spreadsheets.batchUpdate({
        oauth_token: token,
        spreadsheetId: spreadsheetId,
        fields: "*",
        requestBody: {
            requests: [
                {
                    updateCells: {
                        fields: "*",
                        range: {
                            sheetId: subscriptionSheetId,
                            startRowIndex: 0,
                            endRowIndex: 1
                        },
                        rows: createRow([["StartDate", "EndDate", "Cron", "To", "Amount", "URL", "Why?", "Meta"]])
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
    .get(async (req, res) => {
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
