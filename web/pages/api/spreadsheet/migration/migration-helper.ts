import { google, sheets_v4 } from "googleapis";
import Schema$Sheet = sheets_v4.Schema$Sheet;
import { logger } from "../../../../api-utils/logger";

const sheets = google.sheets("v4");
// Spreadsheet revision API does not provide /revert API
// https://stackoverflow.com/questions/57886437/how-to-revert-back-document-to-a-previous-revision/57898660#57898660
// https://stackoverflow.com/questions/60149716/restoring-specific-version-of-spreadsheet-using-the-google-api
// Workaround:
// Create copy spreadsheet's sheet
// Restore(rename) copies spreadsheet to original
// https://stackoverflow.com/questions/64754515/google-drive-api-copy-and-replace
export const createCopiedSheet = async (meta: {
    originalSheet: Schema$Sheet;
    spreadsheetId: string;
    token: string;
}) => {
    const token = meta.token;
    const originalSheet = meta.originalSheet;
    const originalSheetTitle = originalSheet?.properties?.title;
    const originalSheetId = originalSheet?.properties?.sheetId;
    if (!originalSheetTitle || !originalSheetId) {
        throw new Error("Can not fetch original properties");
    }
    const copiedSheetResponse = await sheets.spreadsheets.sheets.copyTo({
        oauth_token: token,
        spreadsheetId: meta.spreadsheetId,
        sheetId: originalSheetId,
        requestBody: {
            destinationSpreadsheetId: meta.spreadsheetId
        }
    });
    const copiedSheetId = copiedSheetResponse.data.sheetId;
    if (!copiedSheetId) {
        throw new Error("Fail to create copy");
    }
    logger.info("Create copy", {
        originalSheetId: originalSheetId,
        copiedSheetId: copiedSheetId
    });
    return {
        copiedSheetId,
        // If success all operation
        async completeOperation(newSheetName: string = originalSheetTitle) {
            // delete original sheet
            await sheets.spreadsheets.batchUpdate({
                oauth_token: token,
                spreadsheetId: meta.spreadsheetId,
                fields: "*",
                requestBody: {
                    requests: [
                        {
                            deleteSheet: {
                                sheetId: originalSheetId
                            }
                        }
                    ]
                }
            });
            logger.info("Delete original sheet");
            // Rename copy to original
            await sheets.spreadsheets.batchUpdate({
                oauth_token: token,
                spreadsheetId: meta.spreadsheetId,
                fields: "*",
                requestBody: {
                    requests: [
                        {
                            updateSheetProperties: {
                                fields: "title", // rename only
                                properties: {
                                    sheetId: copiedSheetId,
                                    title: newSheetName
                                }
                            }
                        }
                    ]
                }
            });
            logger.info("Rename copied sheet", {
                copiedSheetId,
                newSheetName
            });
            logger.info("Complete operation!", {
                originalSheetId: originalSheetId,
                copiedSheetId: copiedSheetId
            });
        },
        // If fail any operation
        async revertOperation() {
            // just delete copied sheet
            await sheets.spreadsheets.batchUpdate({
                oauth_token: token,
                spreadsheetId: meta.spreadsheetId,
                fields: "*",
                requestBody: {
                    requests: [
                        {
                            deleteSheet: {
                                sheetId: copiedSheetId
                            }
                        }
                    ]
                }
            });
            logger.info("revert operation - delete copy", {
                copiedSheetId
            });
        }
    };
};
