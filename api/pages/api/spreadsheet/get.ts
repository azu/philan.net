import { NextApiRequest, NextApiResponse } from 'next'
import { google } from "googleapis";
import { withError, withToken } from "../../api-utils/handler";
import { validateGetRequestQuery } from "./api-types.validator";

const sheets = google.sheets('v4');
// ?spreadsheetId=x&token=y
export const handler = withError(withToken(async (req: NextApiRequest, res: NextApiResponse) => {
    const { spreadsheetId, token } = validateGetRequestQuery(req.query);
    const spreadsheet = await sheets.spreadsheets.get({
        oauth_token: token,
        spreadsheetId,
        includeGridData: true
    });
    const START_OF_USER_DATA = 3;
    const response = spreadsheet?.data?.sheets?.map(sheet => {
        const items = sheet?.data?.[0]
        return {
            year: sheet?.properties?.title,
            items: items?.rowData?.slice(START_OF_USER_DATA).map(row => {
                const values = row.values;
                return {
                    "Date": values?.[0].userEnteredValue?.stringValue,
                    "To": values?.[1].userEnteredValue?.stringValue,
                    "Amount": values?.[2].userEnteredValue?.numberValue,
                    "Url": values?.[3].userEnteredValue?.stringValue,
                    "Memo": values?.[4].userEnteredValue?.stringValue
                }
            })
        }
    })
    res.json(response);
}))

export default handler
