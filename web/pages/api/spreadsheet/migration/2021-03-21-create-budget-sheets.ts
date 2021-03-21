import { UserCredentials } from "../../../../domain/User";
import { createOAuthClient } from "../../../../api-utils/create-OAuth";
import { SheetTitles } from "../SpreadSheetSchema";
import { google, sheets_v4 } from "googleapis";
import { logger } from "../../../../api-utils/logger";
import Schema$CellData = sheets_v4.Schema$CellData;
import { createCopiedSheet } from "./migration-helper";

// const fail = () => {
//     throw new Error("EXPECTED");
// };
const sheets = google.sheets("v4");
const createCell = (cell: string | number): Schema$CellData => {
    if (typeof cell === "number") {
        return {
            userEnteredFormat: {
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
                numberFormat: {
                    type: "CURRENCY"
                }
            },
            userEnteredValue: {
                formulaValue: cell
            }
        };
    }
    // Avoid extra '(apostrophe)
    // https://stackoverflow.com/questions/58173687/google-sheets-api-appending-extra-apostrophe
    return {
        userEnteredValue: {
            stringValue: String(cell)
        }
    };
};

export const migrateToRecordsSheet = async (meta: {
    spreadsheetId: string;
    credentials: UserCredentials;
    dryRun: boolean;
}) => {
    const client = createOAuthClient(meta.credentials);
    const { token } = await client.getAccessToken();
    if (!token) {
        throw new Error("No Access Token");
    }
    const spreadsheet = await sheets.spreadsheets.get({
        oauth_token: token,
        spreadsheetId: meta.spreadsheetId,
        includeGridData: true
    });
    const oldRecordSheet = spreadsheet.data.sheets?.find((sheet) => {
        return sheet.properties?.title === SheetTitles.OLD_Records;
    });
    if (!oldRecordSheet) {
        throw new Error("Not found oldRecordSheet");
    }
    const oldRecordSheetId = oldRecordSheet?.properties?.sheetId;
    // original this is number
    // after migration this is = formula
    const budget = oldRecordSheet?.data?.[0].rowData?.[1]?.values?.[0]?.userEnteredValue?.numberValue;
    const budgetSheet = spreadsheet?.data.sheets?.find((sheet) => {
        return sheet.properties?.title === SheetTitles.Budgets;
    });
    let budgetSheetId = budgetSheet ? budgetSheet?.properties?.sheetId : undefined;
    logger.info("oldRecordSheetId: " + oldRecordSheetId);
    logger.info("Budget: " + budget);
    const { copiedSheetId, completeOperation, revertOperation } = await createCopiedSheet({
        spreadsheetId: meta.spreadsheetId,
        token,
        originalSheet: oldRecordSheet
    });
    logger.info("Created working copy: " + copiedSheetId);
    try {
        // Create Records
        // Create Budgets → refer Records
        // Update Records → refer to Budgets
        // If failed
        // Remove Budgets
        {
            // rename "2021" to "Records" sheet
            !meta.dryRun &&
                (await sheets.spreadsheets.batchUpdate({
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
                                        title: SheetTitles.Records
                                    }
                                }
                            }
                        ]
                    }
                }));
            logger.info(`rename "2021" to "Records" sheet`);
        }
        // Budgets
        {
            // create
            if (!budgetSheet) {
                const createBudgetsSheetResponse = !meta.dryRun
                    ? await sheets.spreadsheets.batchUpdate({
                          oauth_token: token,
                          spreadsheetId: meta.spreadsheetId,
                          fields: "*",
                          requestBody: {
                              includeSpreadsheetInResponse: true, // response includes sheet.id
                              requests: [
                                  // create "Budgets" sheet
                                  {
                                      addSheet: {
                                          properties: {
                                              title: SheetTitles.Budgets,
                                              gridProperties: {
                                                  frozenRowCount: 1
                                              }
                                          }
                                      }
                                  }
                              ]
                          }
                      })
                    : undefined;
                const newBudgetsSheet = createBudgetsSheetResponse?.data?.updatedSpreadsheet?.sheets?.find((sheet) => {
                    return sheet.properties?.title === SheetTitles.Budgets;
                });
                budgetSheetId = newBudgetsSheet ? newBudgetsSheet?.properties?.sheetId : undefined;
                logger.info("Success to create Budgets Sheet: " + budgetSheetId);
            }
            logger.info("Try to update Budgets Sheet: " + budgetSheetId);
            if (budget !== undefined) {
                // add 2021 Formula
                const BudgetData = [
                    ["Year", "Budget", "Used", "Balance"],
                    [
                        "2021",
                        budget,
                        `=SUMIFS('${SheetTitles.Records}'!C:C,'${SheetTitles.Records}'!A:A,INDIRECT(ADDRESS(ROW(),COLUMN()-2))&"-*")`,
                        "=INDIRECT(ADDRESS(ROW(),COLUMN()-2))-INDIRECT(ADDRESS(ROW(),COLUMN()-1))"
                    ]
                ] as (string | number)[][];
                !meta.dryRun &&
                    (await sheets.spreadsheets.batchUpdate({
                        oauth_token: token,
                        spreadsheetId: meta.spreadsheetId,
                        fields: "*",
                        requestBody: {
                            requests: [
                                // create "Budgets" sheet
                                {
                                    updateCells: {
                                        fields: "*",
                                        range: {
                                            sheetId: budgetSheetId,
                                            startRowIndex: 0,
                                            endRowIndex: 2
                                        },
                                        rows: BudgetData.map((line) => {
                                            return {
                                                values: line.map((cellValue) => {
                                                    return createCell(cellValue);
                                                })
                                            };
                                        })
                                    }
                                }
                            ]
                        }
                    }));
            } else {
                logger.info("Budget value is already migration. stop to update Budget sheet");
            }
        }
        // Records
        {
            // Update Formula to refer Budgets
            const RecordData = [
                ["Budget", "Used", "Used", "Balance"],
                [
                    `=IFERROR(Index(QUERY(${SheetTitles.Budgets}!A:B, "select * where A = '"&YEAR(TODAY())&"'", 0),1,2), 0)`,
                    `=SUMIFS(C:C,A:A, YEAR(TODAY())&"-*")`,
                    "=A2-B2"
                ]
            ] as (string | number)[][];
            !meta.dryRun &&
                (await sheets.spreadsheets.batchUpdate({
                    oauth_token: token,
                    spreadsheetId: meta.spreadsheetId,
                    fields: "*",
                    requestBody: {
                        requests: [
                            // create "Budgets" sheet
                            {
                                updateCells: {
                                    fields: "*",
                                    range: {
                                        sheetId: copiedSheetId,
                                        startRowIndex: 0,
                                        endRowIndex: 2
                                    },
                                    rows: RecordData.map((line) => {
                                        return {
                                            values: line.map((cellValue) => {
                                                return createCell(cellValue);
                                            })
                                        };
                                    })
                                }
                            }
                        ]
                    }
                }));
            logger.info(`Update Records sheet with new definition`);
        }
        // 確定
        await completeOperation(SheetTitles.Records);
    } catch (error) {
        logger.error(error);
        // delete copy and budget
        // → stay original sheet
        await revertOperation();
        if (budgetSheetId) {
            await sheets.spreadsheets.batchUpdate({
                oauth_token: token,
                spreadsheetId: meta.spreadsheetId,
                fields: "*",
                requestBody: {
                    requests: [
                        {
                            deleteSheet: {
                                sheetId: budgetSheetId
                            }
                        }
                    ]
                }
            });
        }
        throw error;
    }
};
