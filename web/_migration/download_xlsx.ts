import { google } from "googleapis";
import dayjs from "dayjs";
import fetch from "node-fetch";
import { logger } from "../api-utils/logger";
import { UserCredentials } from "../domain/User";
import { createOAuthClient } from "../api-utils/create-OAuth";
import { getTestCredential, TEST_SPREADSHEET_ID } from "../test/GoogleCredential";
import * as fs from "fs/promises";

const drive = google.drive("v3");
// Spreadsheet revision API does not provide /revert API
// https://stackoverflow.com/questions/57886437/how-to-revert-back-document-to-a-previous-revision/57898660#57898660
// https://stackoverflow.com/questions/60149716/restoring-specific-version-of-spreadsheet-using-the-google-api
const restore = async (meta: { revisionId: string; spreadsheetId: string; token: string }) => {
    // Create export url directly
    // revisions details does not work
    // https://stackoverflow.com/questions/57387113/how-to-get-older-versions-of-google-spreadsheet-data
    const url = `https://docs.google.com/spreadsheets/export?id=${meta.spreadsheetId}&revision=${meta.revisionId}&exportFormat=xlsx`;
    const xlsxContent = await fetch(url, {
        headers: {
            Authorization: `Bearer ${meta.token}`
        }
    }).then((res) => res.buffer());
    await fs.writeFile("test.xlsx", xlsxContent);
    // await drive.files.update({
    //     oauth_token: meta.token,
    //     fileId: meta.spreadsheetId,
    //     media: {
    //         mimeType: "application/vnd.google-apps.spreadsheet",
    //         body: xlsxContent
    //     }
    // });
    logger.info("restore backup file");
};

export const migrateWithBackup = async (meta: { spreadsheetId: string; credentials: UserCredentials }) => {
    const client = createOAuthClient(meta.credentials);
    const { token } = await client.getAccessToken();
    if (!token) {
        throw new Error("No Access Token");
    }
    const revisions = await drive.revisions.list({
        fileId: meta.spreadsheetId,
        oauth_token: token
    });
    const currentRevision = revisions?.data?.revisions?.sort((a, b) => {
        return dayjs(a.modifiedTime!).isBefore(b.modifiedTime!) ? 1 : -1;
    })[0];
    const currentRevisionId = currentRevision?.id;
    if (!currentRevisionId) {
        throw new Error("Not found currentRevisionId");
    }
    logger.info("Current revision id " + currentRevisionId);
    try {
        await restore({
            token,
            spreadsheetId: meta.spreadsheetId,
            revisionId: currentRevisionId
        });
        console.log("OK");
    } catch (error: any) {
        logger.error(error);
        throw error;
    }
    // https://stackoverflow.com/questions/57886437/how-to-revert-back-document-to-a-previous-revision/57898660#57898660
    // https://stackoverflow.com/questions/60149716/restoring-specific-version-of-spreadsheet-using-the-google-api
};

migrateWithBackup({
    spreadsheetId: TEST_SPREADSHEET_ID,
    credentials: getTestCredential()
});
