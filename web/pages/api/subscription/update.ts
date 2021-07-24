import { google } from "googleapis";
import * as fs from "fs";
import path from "path";
import getConfig from "next/config";
import { NextApiRequestWithUserSession, requireLogin } from "../../../api-utils/requireLogin";
import { NextApiResponse } from "next";
import { withSession } from "../../../api-utils/with-session";
import nextConnect, { ErrorHandler } from "next-connect";
import { logger } from "../../../api-utils/logger";
import { getToken, GetTokenMeta } from "../../../api-utils/oauth/getToken";
import oauthScopes from "../../../gas/subscriptions.scope.json";
const { serverRuntimeConfig } = getConfig();
export const updateAppsScript = async (appsScriptId: string, meta: GetTokenMeta) => {
    const token = await getToken(meta);
    const script = google.script({
        version: "v1"
    });
    const createdScriptId = appsScriptId;
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
    script.scripts.run({
        scriptId: createdScriptId,
        requestBody: {
            function: "setTrigger"
        }
    });
    return response;
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
        const appsScriptId = user.appsScriptId;
        if (!appsScriptId) {
            throw new Error("User did not integrate subscription");
        }
        logger.info(`user: ${user.id} will update appsScript: ${appsScriptId}`);
        await updateAppsScript(appsScriptId, {
            credentials: user.credentials
        });
        logger.info(`user: ${user.id} update appsScript: ${appsScriptId}`);
        res.json({
            appsScriptId: appsScriptId
        });
    });
export default handler;
