import { NextApiRequest, NextApiResponse } from 'next'
import { google } from "googleapis";
import { withError, withToken } from "../../../api-utils/handler";
import { validateAddRequestBody, validateAddRequestQuery } from "./api-types.validator";

const sheets = google.sheets('v4');
// ?spreadsheetId=x&token=y
export const handler = withError(withToken(async (req: NextApiRequest, res: NextApiResponse) => {
    const { spreadsheetId, token } = validateAddRequestQuery(req.query);
    const { amount, memo, to, url } = validateAddRequestBody(req.body);
    const nowDate = new Date().toISOString();
    const spreadsheet = await sheets.spreadsheets.get({
        oauth_token: token,
        spreadsheetId,
    });
    const TITLT_IT_WILL_BE_PARAMETER = "2021";
    const foundSheet = spreadsheet.data.sheets?.find(sheet => {
        return sheet.properties?.title === TITLT_IT_WILL_BE_PARAMETER
    });
    if (!foundSheet) {
        throw new Error("Not found sheet");
    }
    const foundSheetId = foundSheet?.properties?.sheetId;
    const updateResult = await sheets.spreadsheets.batchUpdate({
        oauth_token: token,
        spreadsheetId: spreadsheetId,
        requestBody: {
            requests: [{
                appendCells: {
                    sheetId: foundSheetId,
                    fields: '*',
                    rows: [{
                        values: [nowDate, to, amount, url, memo].map((v) => {
                            if (typeof v === "number") {
                                return {
                                    userEnteredFormat: {
                                        numberFormat: {
                                            type: "CURRENCY"
                                        }
                                    },
                                    userEnteredValue: {
                                        numberValue: v
                                    }
                                }
                            }
                            return {
                                userEnteredValue: {
                                    stringValue: v
                                }
                            }
                        })
                    }],
                }
            }]
        },
    });
    res.json(updateResult.data);
}))

export default handler
