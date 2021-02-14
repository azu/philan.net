import { NextApiRequest, NextApiResponse } from "next";
import { google, sheets_v4 } from "googleapis";
import { withError, withToken } from "../../../api-utils/handler";
import { validateCreateRequestQuery } from "./api-types.validator";

type Schema$RowData = sheets_v4.Schema$RowData;
type Schema$CellData = sheets_v4.Schema$CellData;

export const createNewSheet = ({ token, budget }: { token: string; budget: number }) => {
    const DefaultData = [
        ["Budget", "Used", "Balance"],
        // append-safe way
        // Count(A1:A) avoid curricular dependencies
        [budget, "=SUM(OFFSET(C3,1,0,Count(A1:A)))", "=A2-SUM(OFFSET(C3,1,0,Count(A1:A)))"],
        // TODO: monthly?,
        ["Date", "To", "Amount", "URL", "Memo"]
    ] as (string | number)[][];
    const createCell = (cell: string | number): Schema$CellData => {
        if (typeof cell === "number") {
            return {
                userEnteredFormat: {
                    verticalAlignment: "TOP",
                    numberFormat: {
                        type: "CURRENCY"
                    }
                },
                userEnteredValue: {
                    numberValue: cell
                }
            };
        }
        if (cell.startsWith("=")) {
            return {
                userEnteredFormat: {
                    verticalAlignment: "TOP",
                    numberFormat: {
                        type: "CURRENCY"
                    }
                },
                userEnteredValue: {
                    formulaValue: cell
                }
            };
        }
        return {
            userEnteredFormat: {
                verticalAlignment: "TOP"
            },
            userEnteredValue: {
                stringValue: String(cell)
            }
        };
    };
    const rowData: Schema$RowData[] = DefaultData.map((line) => {
        return {
            values: line.map((cellValue) => {
                return createCell(cellValue);
            })
        };
    });
    return sheets.spreadsheets.create({
        oauth_token: token,
        requestBody: {
            properties: {
                title: "philan.net",
                defaultFormat: {
                    numberFormat: {
                        type: "CURRENCY"
                    }
                }
            },
            sheets: [
                {
                    properties: {
                        title: "2021",
                        gridProperties: {
                            // fixed
                            frozenRowCount: 3
                        }
                    },
                    data: [
                        {
                            rowData
                        }
                    ]
                }
            ]
        }
    });
};

const sheets = google.sheets("v4");
export const handler = withError(
    withToken(async (req: NextApiRequest, res: NextApiResponse) => {
        const { token } = validateCreateRequestQuery(req.query);
        const spreadsheet = await createNewSheet({ token, budget: 10000 });
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
    })
);

export default handler;
