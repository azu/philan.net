import { google } from "googleapis";
import { SheetTitles } from "../../spreadsheet/SpreadSheetSchema";
import { createRow } from "../../../../api-utils/spreadsheet-util";
import { NextApiRequestWithUserSession, requireLogin } from "../../../../api-utils/requireLogin";
import { NextApiResponse } from "next";
import { withSession } from "../../../../api-utils/with-session";
import nextConnect, { ErrorHandler } from "next-connect";
import { logger } from "../../../../api-utils/logger";
import { getToken, GetTokenMeta } from "../../../../api-utils/oauth/getToken";
import { validateAddSubscritionRequestBody } from "../api-types.validator";

export const addSubscription = async (
    item: {
        // start and end date does not require time
        // e.g. 2021-01-01 is ok
        // time is just ignored
        startDate: string;
        cron: string;
        to: string;
        url: string;
        amount: number;
        memo: string;
    },
    meta: GetTokenMeta & {
        spreadsheetId: string;
    }
) => {
    const token = await getToken(meta);
    const sheets = google.sheets("v4");
    const spreadsheet = await sheets.spreadsheets.get({
        oauth_token: token,
        spreadsheetId: meta.spreadsheetId
    });
    const foundSheet = spreadsheet.data.sheets?.find((sheet) => {
        return sheet.properties?.title === SheetTitles.Subscriptions;
    });
    if (!foundSheet) {
        throw new Error("Not found sheet");
    }
    const foundSheetId = foundSheet?.properties?.sheetId;
    // TODO: use append is atomic
    // batchUpdate is not atomic
    // https://groups.google.com/g/google-spreadsheets-api/c/G0sUsBHlaZg
    const row = [
        item.startDate,
        "", // end date is empty
        item.cron,
        item.to,
        item.amount,
        item.url,
        item.memo
    ];
    return sheets.spreadsheets.batchUpdate({
        oauth_token: token,
        spreadsheetId: meta.spreadsheetId,
        requestBody: {
            requests: [
                {
                    appendCells: {
                        sheetId: foundSheetId,
                        fields: "*",
                        rows: createRow([row])
                    }
                }
            ]
        }
    });
};

const onError: ErrorHandler<any, NextApiResponse> = (error, _req, res) => {
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
        if (!user.appsScriptId) {
            throw new Error("Not found appsScriptId");
        }
        const { startDate, cron, to, url, amount, memo } = validateAddSubscritionRequestBody(req.body);
        const sub = await addSubscription(
            { startDate, cron, to, url, amount, memo },
            {
                credentials: user.credentials,
                spreadsheetId: user.spreadsheetId
            }
        );
        logger.info(`user: ${user.id} add subscription item`);
        res.json(sub);
    });
export default handler;
