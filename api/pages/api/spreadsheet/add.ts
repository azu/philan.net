import { NextApiRequest, NextApiResponse } from 'next'
import { google } from "googleapis";
import { withError, withToken } from "../../api-utils/handler";
import { validateAddRequestBody, validateAddRequestQuery } from "./api-types.validator";

const sheets = google.sheets('v4');
// ?spreadsheetId=x&token=y
export const handler = withError(withToken(async (req: NextApiRequest, res: NextApiResponse) => {
    const { spreadsheetId, token } = validateAddRequestQuery(req.query);
    console.log("req.body",typeof req.body)
    const { amount, memo, to, url } = validateAddRequestBody(req.body);
    const nowDate = new Date().toISOString();
    const spreadsheet = await sheets.spreadsheets.values.append({
        oauth_token: token,
        spreadsheetId: spreadsheetId,
        range: "A4", // new line
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
            values: [
                // ["Date", "To", "Amount", "URL", "Memo"]
                [nowDate, to, amount, url, memo],
            ],
        },
    });
    /**
     *
     {
  spreadsheetId: 'id',
  properties: {
    title: 'philan.net',
    locale: 'ja_JP',
    autoRecalc: 'ON_CHANGE',
    timeZone: 'Asia/Tokyo',
    defaultFormat: {
      backgroundColor: [Object],
      padding: [Object],
      verticalAlignment: 'BOTTOM',
      wrapStrategy: 'OVERFLOW_CELL',
      textFormat: [Object],
      backgroundColorStyle: [Object]
    },
    spreadsheetTheme: { primaryFontFamily: 'Arial', themeColors: [Array] }
  },
  sheets: [ { properties: [Object] } ],
  spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/{spreadsheetId}/edit'
}
     */
    res.json(spreadsheet.data);
}))

export default handler
