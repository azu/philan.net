import { NextApiResponse } from "next";
import { google, sheets_v4 } from "googleapis";
import nextConnect from "next-connect";
import { NextApiRequestWithSession, withSession } from "../../../api-utils/with-session";
import { createUserKvs } from "../../../api-utils/userKvs";
import { validateCreateUserRequestBody } from "../user/api-types.validator";
import { createOAuthClient } from "../../../api-utils/create-OAuth";
import { UserCredentials } from "../../../domain/User";

type Schema$RowData = sheets_v4.Schema$RowData;
type Schema$CellData = sheets_v4.Schema$CellData;

export const createNewSheet = async (
    { budget }: { budget: number },
    meta: {
        credentials: UserCredentials;
    }
) => {
    const client = createOAuthClient(meta.credentials);
    const { token } = await client.getAccessToken();
    if (!token) {
        throw new Error("No Access Token");
    }
    const DefaultData = [
        ["Budget", "Used", "Balance"],
        // append-safe way
        // Count(A1:A) avoid curricular dependencies
        [budget, "=SUM(OFFSET(C3,1,0,ROWS(A1:A)))", "=A2-SUM(OFFSET(C3,1,0,ROWS(A1:A)))"],
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

const handler = nextConnect<NextApiRequestWithSession, NextApiResponse>()
    .use(withSession())
    .get(async (req, res) => {
        const { budget } = validateCreateUserRequestBody(req.body);
        const userKVS = createUserKvs();
        const user = await userKVS.findByGoogleId(req.session.get("googleUserId"));
        if (!user) {
            throw new Error("No user");
        }
        const responseNewSheet = await createNewSheet(
            {
                budget
            },
            {
                credentials: user.credentials
            }
        );
        res.json({
            spreadsheetId: responseNewSheet.data.spreadsheetId
        });
    });
export default handler;
