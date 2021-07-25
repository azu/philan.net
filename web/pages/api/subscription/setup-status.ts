import { google } from "googleapis";
import { SheetTitles } from "../spreadsheet/SpreadSheetSchema";
import { NextApiRequestWithUserSession, requireLogin } from "../../../api-utils/requireLogin";
import { NextApiResponse } from "next";
import { withSession } from "../../../api-utils/with-session";
import nextConnect, { ErrorHandler } from "next-connect";
import { getToken, GetTokenMeta } from "../../../api-utils/oauth/getToken";
import { logger } from "../../../api-utils/logger";
import type { SetupStatusResponseBody } from "./api-types";

export const testSubscriptionSheet = async ({
    spreadsheetId,
    meta
}: {
    spreadsheetId: string;
    meta: GetTokenMeta;
}): Promise<boolean> => {
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
        return false;
    }
    const subscriptionSheet = spreadsheet?.data?.sheets?.find((sheet) => {
        return sheet?.properties?.title === SheetTitles.Subscriptions;
    });
    return subscriptionSheet !== undefined;
};

const onError: ErrorHandler<any, NextApiResponse> = (error, _req, res) => {
    logger.error(error);
    if (process.env.NODE_ENV === "production") {
        res.status(500).end("Server Error");
    } else {
        res.status(500).end(error.stack);
    }
};
const handler = nextConnect<NextApiRequestWithUserSession, NextApiResponse<SetupStatusResponseBody>>({ onError })
    .use(withSession())
    .use(requireLogin())
    .get(async (req, res) => {
        const user = req.user;
        if (!user) {
            throw new Error("No user");
        }
        const hasSubscriptionSheet = await testSubscriptionSheet({
            spreadsheetId: user.spreadsheetId,
            meta: {
                credentials: user.credentials
            }
        });
        res.json({
            hasSubscriptionSheet,
            hasAppsScript: Boolean(user.appsScriptId)
        });
    });

export default handler;
