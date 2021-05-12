import { google } from "googleapis";
import { createOAuthClient } from "../../../api-utils/create-OAuth";
import { UserCredentials } from "../../../domain/User";
import * as fs from "fs";
import path from "path";
import getConfig from "next/config";

const { serverRuntimeConfig } = getConfig();

const script = google.script({
    version: "v1"
});
export const createAppsScript = async (
    spreadsheetId: string,
    meta: {
        credentials: UserCredentials;
    }
) => {
    const client = createOAuthClient(meta.credentials);
    const { token } = await client.getAccessToken();
    if (!token) {
        throw new Error("No Access Token");
    }
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
        path.join(serverRuntimeConfig.PROJECT_ROOT, "pages/api/appsscript/gas.js"),
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
                    source: JSON.stringify({ runtimeVersion: "V8" }),
                    type: "JSON"
                }
            ]
        }
    });
    return response;
};
