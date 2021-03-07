import { NextApiResponse } from "next";
import { google, sheets_v4 } from "googleapis";
import nextConnect from "next-connect";
import { withSession } from "../../../api-utils/with-session";
import { validateCreateUserRequestBody } from "../user/api-types.validator";
import { createOAuthClient } from "../../../api-utils/create-OAuth";
import { UserCredentials } from "../../../domain/User";
import { NextApiRequestWithUserSession, requireLogin } from "../../../api-utils/requireLogin";
import dayjs from "dayjs";

type Schema$RowData = sheets_v4.Schema$RowData;
type Schema$CellData = sheets_v4.Schema$CellData;

export const createNewSheet = async (
    { budget, README }: { budget: number; README: string },
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
        ["Budget", "Used", "Balance", "README"],
        // append-safe way
        // Count(A1:A) avoid curricular dependencies
        [budget, "=SUM(OFFSET(C3,1,0,ROWS(A1:A)))", "=A2-SUM(OFFSET(C3,1,0,ROWS(A1:A)))", README],
        // TODO: monthly?,
        ["Date", "To", "Amount", "URL", "Why?", "Meta"]
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
    const CURRENT_YEAR = dayjs().format("YYYY");
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
                        title: CURRENT_YEAR,
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

const handler = nextConnect<NextApiRequestWithUserSession, NextApiResponse>()
    .use(withSession())
    .use(requireLogin())
    .get(async (req, res) => {
        const { budget, README } = validateCreateUserRequestBody(req.body);
        const user = req.user;
        if (!user) {
            throw new Error("No user");
        }
        const responseNewSheet = await createNewSheet(
            {
                budget,
                README
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
