import { google } from "googleapis";
import * as fs from "fs";
import * as path from "path";
import getConfig from "next/config";
import { NextApiRequestWithUserSession, requireLogin } from "../../../../api-utils/requireLogin";
import { NextApiResponse } from "next";
import { withSession } from "../../../../api-utils/with-session";
import nextConnect, { ErrorHandler } from "next-connect";
import { logger } from "../../../../api-utils/logger";
import { getToken, GetTokenMeta } from "../../../../api-utils/oauth/getToken";
import { createUserKvs } from "../../../../api-utils/userKvs";
import oauthScopes from "../../../../gas/subscriptions.scope.json";
import { validateAppsScriptCreateRequestBody } from "../api-types.validator";

const { serverRuntimeConfig } = getConfig();
export const createAppsScript = async (spreadsheetId: string, meta: GetTokenMeta) => {
    const token = await getToken(meta);
    const script = google.script({
        version: "v1"
    });
    const startTime = Date.now();
    const project = await script.projects.create({
        oauth_token: token,
        requestBody: {
            title: "philan.net",
            parentId: spreadsheetId
        }
    });
    logger.info(`creation time: ${Date.now() - startTime}ms`);
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
    logger.info(`update time: ${Date.now() - startTime}ms`);
    // TODO: will be failed in first time
    // script.scripts.run({
    //     scriptId: createdScriptId,
    //     requestBody: {
    //         function: "setTrigger"
    //     }
    // });
    return response;
};

const onError: ErrorHandler<any, NextApiResponse> = (error, _, res) => {
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
        const { force } = validateAppsScriptCreateRequestBody(req.body);
        if (!force && user.appsScriptId) {
            return res.json({
                ok: false,
                message: "Already created subscription apps and sheet!"
            });
        }
        const appsScript = await createAppsScript(user.spreadsheetId, {
            credentials: user.credentials
        });
        const appsScriptId = appsScript.data.scriptId;
        logger.info(`user: ${user.id} created appsScript: ${appsScriptId}, force: ${force}`);
        if (appsScriptId) {
            const kvs = await createUserKvs();
            await kvs.updateUser(user.googleId, {
                ...user,
                appsScriptId: appsScriptId
            });
        }
        res.json({
            ok: true
        });
    });
export default handler;
