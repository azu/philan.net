import { NextApiRequest, NextApiResponse } from 'next'
import { google } from "googleapis";
import { withError, withToken } from "../../../api-utils/handler";
import { validateGetRequestQuery } from "./api-types.validator";
import { GetResponseBody } from "./api-types";

const sheets = google.sheets('v4');
// ?spreadsheetId=x&token=y
export const handler = withError(withToken(async (req: NextApiRequest, res: NextApiResponse<GetResponseBody>) => {
    const { spreadsheetId, token } = validateGetRequestQuery(req.query);
    const spreadsheet = await sheets.spreadsheets.get({
        oauth_token: token,
        spreadsheetId,
        includeGridData: true
    });
    const START_OF_USER_DATA = 3;
    if (!spreadsheet?.data?.sheets) {
        throw new Error("500: No spreadsheet data");
    }
    const response = spreadsheet?.data?.sheets?.map(sheet => {
        const items = sheet?.data?.[0]
        // ["Budget", "Used", "Balance"]
        const statsRow = items?.rowData?.[1];
        const rowDate = items?.rowData?.slice(START_OF_USER_DATA) ?? [];
        return {
            year: sheet?.properties?.title!,
            stats: {
                budge: {
                    raw: statsRow?.values?.[0]?.effectiveValue?.numberValue!,
                    value: statsRow?.values?.[0]?.formattedValue!
                },
                used: {
                    raw: statsRow?.values?.[1]?.effectiveValue?.numberValue!,
                    value: statsRow?.values?.[1]?.formattedValue!
                },
                balance: {
                    raw: statsRow?.values?.[2]?.effectiveValue?.numberValue!,
                    value: statsRow?.values?.[2]?.formattedValue!
                },
            },
            items: rowDate?.map(row => {
                const values = row.values;
                return {
                    "date": values?.[0].userEnteredValue?.stringValue!,
                    "to": values?.[1].userEnteredValue?.stringValue!,
                    "amount": {
                        raw: values?.[2].userEnteredValue?.numberValue!,
                        value: values?.[2]?.formattedValue!
                    },
                    "url": values?.[3].userEnteredValue?.stringValue!,
                    "memo": values?.[4].userEnteredValue?.stringValue!
                }
            })
        }
    });
    res.json(response);
}))

export default handler
