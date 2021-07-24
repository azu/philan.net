import { google } from "googleapis";
import * as fs from "fs";
import path from "path";
import getConfig from "next/config";
import { SheetTitles } from "../spreadsheet/SpreadSheetSchema";
import { createRow } from "../../../api-utils/spreadsheet-util";
import { NextApiRequestWithUserSession, requireLogin } from "../../../api-utils/requireLogin";
import { NextApiResponse } from "next";
import { withSession } from "../../../api-utils/with-session";
import nextConnect, { ErrorHandler } from "next-connect";
import { logger } from "../../../api-utils/logger";
import { getToken, GetTokenMeta } from "../../../api-utils/oauth/getToken";
import { createUserKvs } from "../../../api-utils/userKvs";
import oauthScopes from "../../../gas/subscriptions.scope.json";
const { serverRuntimeConfig } = getConfig();
export const createAppsScript = async (spreadsheetId: string, meta: GetTokenMeta) => {
    const token = await getToken(meta);
    const script = google.script({
        version: "v1"
    });
    const project = await script.projects.create({
        oauth_token: token,
        requestBody: {
            title: "philan.net",
            parentId: spreadsheetId
        }
    });
    const createdScriptId = project.data.scriptId;
    if (!createdScriptId) {
        throw new Error("Not found createdScriptId");
    }
    const source = await fs.promises.readFile(
        path.join(serverRuntimeConfig.PROJECT_ROOT, "pages/api/subscription/subscription.gs.js"),
        "utf-8"
    );
    const response = await script.projects.updateContent({
        oauth_token: token,
        scriptId: createdScriptId,
        requestBody: {
            scriptId: createdScriptId,
            files: [
                {
                    name: "main",
                    source: source,
                    type: "SERVER_JS"
                },
                {
                    name: "appsscript",
                    source: JSON.stringify({
                        runtimeVersion: "V8",
                        oauthScopes: oauthScopes
                    }),
                    type: "JSON"
                }
            ]
        }
    });
    // TODO: will be failed in first time
    // script.scripts.run({
    //     scriptId: createdScriptId,
    //     requestBody: {
    //         function: "setTrigger"
    //     }
    // });
    return response;
};

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
                // create "Budgets" sheet
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
        if (user.appsScriptId) {
            throw new Error("Already created subscription apps and sheet!");
        }
        const [appsScript] = await Promise.all([
            createAppsScript(user.spreadsheetId, {
                credentials: user.credentials
            }),
            createSubscriptionSheet(user.spreadsheetId, {
                credentials: user.credentials
            })
        ]);
        const appsScriptId = appsScript.data.scriptId;
        logger.info(`user: ${user.id} created subscription sheet in ${user.spreadsheetId}`);
        logger.info(`user: ${user.id} created appsScript: ${appsScriptId}`);
        if (appsScriptId) {
            const kvs = await createUserKvs();
            await kvs.updateUser(user.googleId, {
                ...user,
                appsScriptId: appsScriptId
            });
        }
        res.json({
            spreadsheetId: user.spreadsheetId,
            appsScriptId: appsScriptId
        });
    });
export default handler;
